import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { exportFunction } from '../../utils/firebase/deploy';
import functions from '../../utils/firebase/baseFunction';
import { CloudFunction } from 'firebase-functions/lib/cloud-functions';
import { ObjectMetadata } from 'firebase-functions/lib/providers/storage';
import { defineSecret } from 'firebase-functions/v2/params';
import { hasAlreadyTriggered } from '../../utils/firebase/hasAlreadyTriggered';
import { logger } from '../../utils/firebase/logger';
import { db, storage } from '../../utils/firebase/firebase';
import { sliceChunksByNumber, stringToChunks } from '../../utils/file';
import { createEncryptedMessageString } from '../../utils/symbol/message';
import { AdminUser } from '../models/adminUser';
import { decrypt } from '../../utils/cipher/encrypt';
import { PrivateUserFile } from '../../v1/models/privateUserFile';
import { PrivateUserFileTransactionInfo } from '../models/privateUserFileTransaction';
import {
  sendAggregateCompleteTransactionToUploadEncryptedFileChunk,
  UploadEncryptedFileChunkInfo,
} from '../../utils/symbol/transactions/sendAggregateCompleteTransactionToUploadEncryptedFileChunk';

const SERVICE_ENCRYPT_KEY = defineSecret('SERVICE_ENCRYPT_KEY');
const SERVICE_FEE_PAYER_ACCOUNT_PRIVATE_KEY = defineSecret('SERVICE_FEE_PAYER_ACCOUNT_PRIVATE_KEY');

const _exportFunction = (name: string, f: () => CloudFunction<ObjectMetadata>) =>
  exportFunction(['v1', 'storage', name], exports, f);

_exportFunction('onFinalize', () =>
  functions()
    .runWith({
      secrets: ['SERVICE_ENCRYPT_KEY', 'SERVICE_FEE_PAYER_ACCOUNT_PRIVATE_KEY'],
      timeoutSeconds: 540,
      memory: '8GB',
    })
    .storage.object()
    .onFinalize(async (object, context) => {
      if (await hasAlreadyTriggered(context.eventId, 'v1-storage-onFinalize')) {
        return;
      }
      logger.debug({ object, context });
      const filePath = object.name;
      if (!filePath) {
        return;
      }
      logger.debug({ filePath });
      const regExpUserId = /users\/[0-9a-zA-Z]*/;
      const userIdMatch = filePath.match(regExpUserId);
      if (!userIdMatch) {
        throw Error('userId is not found in filePath');
      }
      logger.debug(userIdMatch[0]);
      const userId = userIdMatch[0].replace('users/', '');
      logger.debug({ userId });
      if (!userId) {
        throw Error('userId is not found in filePath');
      }
      const adminUserDocumentData = await (await db.doc(`/v/1/types/admin/users/${userId}`).get()).data();
      if (!adminUserDocumentData) {
        throw Error('adminUser is not found');
      }
      adminUserDocumentData.userCreatedAt = adminUserDocumentData.userCreatedAt.toDate();
      adminUserDocumentData.userUpdatedAt = adminUserDocumentData.userUpdatedAt.toDate();
      const adminUser = adminUserDocumentData as AdminUser;

      logger.debug('Decrypting...');
      const userServiceFeePayerAccountPrivateKeyString = SERVICE_FEE_PAYER_ACCOUNT_PRIVATE_KEY.value();
      const userServiceStorageAccountPublicKeyString = adminUser.userServiceStorageAccountPublicKeyString;
      const serviceEncryptKey = SERVICE_ENCRYPT_KEY.value();
      const userMultisigAccountPrivateKeyString = decrypt(
        adminUser.userMultisigAccountPrivateKeyEncryptedString,
        serviceEncryptKey,
        adminUser.userSaltBase64String,
        adminUser.userIvHexString,
      );
      const userCosigner1AccountPrivateKeyString = decrypt(
        adminUser.userCosigner1AccountPrivateKeyEncryptedString,
        serviceEncryptKey,
        adminUser.userSaltBase64String,
        adminUser.userIvHexString,
      );
      const userCosigner2AccountPrivateKeyString = decrypt(
        adminUser.userCosigner2AccountPrivateKeyEncryptedString,
        serviceEncryptKey,
        adminUser.userSaltBase64String,
        adminUser.userIvHexString,
      );
      logger.debug('Decrypted');

      const regExpFileId = /files\/[0-9a-zA-Z]*/;
      const fileIdMatch = filePath.match(regExpFileId);
      if (!fileIdMatch) {
        throw Error('fileId is not found in filePath');
      }
      logger.debug(fileIdMatch[0]);
      const fileId = fileIdMatch[0].replace('files/', '');
      logger.debug({ fileId });
      if (!fileId) {
        throw Error('fileId is not found in filePath');
      }
      const fileName = path.basename(filePath);
      logger.debug({ fileName });
      const fileSize = parseInt(object.size, 10);
      const fileTimeCreated = object.timeCreated;
      const fileUpdated = object.updated;
      const fileMd5Hash = object.md5Hash ?? '';
      const fileMimeType = object.contentType ?? '';
      const file: PrivateUserFile = {
        fileId,
        fileSize,
        fileTimeCreated,
        fileUpdated,
        fileMd5Hash,
        fileMimeType,
        fileName,
        fileBucket: object.bucket,
        fileMetaGeneration: object.metageneration,
        fileFullPath: object.name,
      };
      await db.doc(`/v/1/types/private/users/${userId}/files/${fileId}`).set(file, { merge: true });

      const localFilePath = `/tmp/${fileName}`;
      logger.debug({ localFilePath });
      const fileRef = storage.bucket().file(filePath);
      const fileObject = await storage.bucket().file(filePath).get();
      logger.debug({ fileObject });
      const fileReadableStream = fileRef.createReadStream();
      const fileWritableStream = fs.createWriteStream(localFilePath);
      fileWritableStream.on('finish', async () => {
        logger.debug(`fileWritableStream finished ${fileName}`);
        const targetFileBuffer = fs.readFileSync(localFilePath);
        const targetFileBufferLength = targetFileBuffer.length;
        logger.debug({ targetFileBufferLength });
        const targetFileHexString = targetFileBuffer.toString('hex');
        const targetFileHexStringLength = targetFileHexString.length;
        logger.debug({ targetFileHexStringLength });
        // Note: メッセージ最大サイズ1024バイト、先頭1文字、メッセージの暗号化でサイズが増加する分28文字を加味
        const targetFileHexStringChunks = stringToChunks(targetFileHexString, Math.floor((1024 - 1 * 2 - 28 * 2) / 2));
        logger.debug(targetFileHexStringChunks.length);
        const targetFileEncryptedHexStringChunks = targetFileHexStringChunks.map((targetFileHexStringChunk) => {
          const encryptedMessageHexString = createEncryptedMessageString(
            targetFileHexStringChunk,
            adminUser.userServiceStorageAccountPublicKeyString,
            userMultisigAccountPrivateKeyString,
          );
          return encryptedMessageHexString;
        });
        const chunks = sliceChunksByNumber(targetFileEncryptedHexStringChunks, 99);
        logger.debug({ chunksLength: chunks.length });
        logger.debug({ chunks });
        const privateUserFileTransactions: PrivateUserFileTransactionInfo[] = sliceChunksByNumber(
          targetFileEncryptedHexStringChunks,
          99,
        ).map((chunks: string[], index, array) => {
          return {
            index,
            length: array.length,
            chunks: chunks.map((chunk, index) => {
              return {
                index,
                encryptedHexString: chunk,
              };
            }),
          };
        });
        logger.debug(privateUserFileTransactions.length);
        for (let index = 0; index < privateUserFileTransactions.length; index++) {
          const privateUserFileTransaction = privateUserFileTransactions[index];
          const uploadEncryptedFileChunkInfo: UploadEncryptedFileChunkInfo = {
            userId,
            userServiceFeePayerAccountPrivateKeyString,
            userServiceStorageAccountPublicKeyString,
            userMultisigAccountPrivateKeyString,
            userCosigner1AccountPrivateKeyString,
            userCosigner2AccountPrivateKeyString,
            file,
            transactionInfo: privateUserFileTransaction,
          };
          await sendAggregateCompleteTransactionToUploadEncryptedFileChunk(uploadEncryptedFileChunkInfo);
        }
        logger.debug(targetFileEncryptedHexStringChunks.length);
        const downloadedMd5Hash = crypto.createHash('md5').update(targetFileBuffer).digest('base64');
        logger.debug({ downloadedMd5Hash });
        fs.unlinkSync(localFilePath);
      });
      fileReadableStream.pipe(fileWritableStream);
      logger.debug('fileReadableStream piped');
    }),
);
