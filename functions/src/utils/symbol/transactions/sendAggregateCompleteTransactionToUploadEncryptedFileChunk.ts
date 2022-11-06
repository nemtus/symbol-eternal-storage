import {
  Account,
  PublicAccount,
  Deadline,
  PlainMessage,
  EncryptedMessage,
  InnerTransaction,
  TransferTransaction,
  AggregateTransaction,
  AggregateTransactionCosignature,
  CosignatureTransaction,
  CosignatureSignedTransaction,
  TransactionMapping,
  RepositoryFactoryHttp,
  TransactionInfo,
} from 'symbol-sdk';
import { PrivateUserFile } from '../../../v1/models/privateUserFile';
import { AdminUserTransaction } from '../../../v1/models/adminUserTransaction';
import { UploadEncryptedFileChunkMessage } from '../../../v1/models/message';
import { db } from '../../firebase/firebase';
import { logger } from '../../firebase/logger';
import { epochAdjustment, networkGenerationHash, networkType } from '../network';
import { selectRandomNode } from '../node';
import {
  PrivateUserFileTransaction,
  PrivateUserFileTransactionInfo,
} from '../../../v1/models/privateUserFileTransaction';

export interface UploadEncryptedFileChunkInfo {
  userId: string;
  userServiceFeePayerAccountPrivateKeyString: string;
  userServiceStorageAccountPublicKeyString: string;
  userMultisigAccountPrivateKeyString: string;
  userCosigner1AccountPrivateKeyString: string;
  userCosigner2AccountPrivateKeyString: string;
  file: PrivateUserFile;
  transactionInfo: PrivateUserFileTransactionInfo;
}

export const sendAggregateCompleteTransactionToUploadEncryptedFileChunk = async (
  uploadEncryptedFileChunkInfo: UploadEncryptedFileChunkInfo,
) => {
  logger.debug('sendAggregateCompleteTransactionToUploadEncryptedFileChunk start');

  const userServiceFeePayerAccount = Account.createFromPrivateKey(
    uploadEncryptedFileChunkInfo.userServiceFeePayerAccountPrivateKeyString,
    networkType,
  );
  const userServiceStoragePublicAccount = PublicAccount.createFromPublicKey(
    uploadEncryptedFileChunkInfo.userServiceStorageAccountPublicKeyString,
    networkType,
  );
  const userMultisigAccount = Account.createFromPrivateKey(
    uploadEncryptedFileChunkInfo.userMultisigAccountPrivateKeyString,
    networkType,
  );
  const userCosigner1Account = Account.createFromPrivateKey(
    uploadEncryptedFileChunkInfo.userCosigner1AccountPrivateKeyString,
    networkType,
  );
  const userCosigner2Account = Account.createFromPrivateKey(
    uploadEncryptedFileChunkInfo.userCosigner2AccountPrivateKeyString,
    networkType,
  );

  logger.debug('Init innerTransactions array');
  const embeddedTransactions: InnerTransaction[] = [];

  logger.debug('embeddedTransferTransaction');
  const deadline = Deadline.create(epochAdjustment);
  const messageJson: UploadEncryptedFileChunkMessage = {
    serviceId: userServiceStoragePublicAccount.address.plain(),
    serviceName: 'Symbol Eternal Storage',
    userId: uploadEncryptedFileChunkInfo.userId,
    userMultisigAccountAddress: userMultisigAccount.address.plain(),
    type: 'uploadEncryptedFileChunk',
    fileId: uploadEncryptedFileChunkInfo.file.fileId,
    fileSize: uploadEncryptedFileChunkInfo.file.fileSize,
    fileTimeCreated: uploadEncryptedFileChunkInfo.file.fileTimeCreated,
    fileUpdated: uploadEncryptedFileChunkInfo.file.fileUpdated,
    fileMd5Hash: uploadEncryptedFileChunkInfo.file.fileMd5Hash,
    fileMimeType: uploadEncryptedFileChunkInfo.file.fileMimeType,
    chunkIndex: uploadEncryptedFileChunkInfo.transactionInfo.index,
    chunkLength: uploadEncryptedFileChunkInfo.transactionInfo.length,
  };
  logger.debug(messageJson);
  const messageString = JSON.stringify(messageJson);
  logger.debug(messageString.length);
  const embeddedTransferTransaction = TransferTransaction.create(
    deadline,
    userMultisigAccount.address,
    [],
    PlainMessage.create(messageString),
    networkType,
  ).toAggregate(userServiceFeePayerAccount.publicAccount);
  embeddedTransactions.push(embeddedTransferTransaction);

  logger.debug('embeddedTransferTransaction to uploadEncryptedFileChunks');
  const chunks = uploadEncryptedFileChunkInfo.transactionInfo.chunks;
  for (let index = 0; index < chunks.length; index++) {
    const chunk = chunks[index];
    const encryptedMessageHexString = chunk.encryptedHexString;
    const embeddedTransferTransaction = TransferTransaction.create(
      deadline,
      userServiceStoragePublicAccount.address,
      [],
      new EncryptedMessage(encryptedMessageHexString, userServiceStoragePublicAccount),
      networkType,
    ).toAggregate(userMultisigAccount.publicAccount);
    embeddedTransactions.push(embeddedTransferTransaction);
  }

  logger.debug('aggregateCompleteTransaction');
  const initialEmptyCosignatures: AggregateTransactionCosignature[] = [];
  const feeMultiplier = 100;
  const requiredCosignatories = 3;
  const aggregateCompleteTransaction = AggregateTransaction.createComplete(
    deadline,
    embeddedTransactions,
    networkType,
    initialEmptyCosignatures,
  ).setMaxFeeForAggregate(feeMultiplier, requiredCosignatories);

  // Note: ここから必要な署名を集めていく(トランザクションをアナウンスするアカウント(serviceFeePayerAccount)の署名1アカウント分+その他連署4アカウント分)

  // Note: まず最初に最終的にトランザクションをアナウンスするアカウントで署名。
  logger.debug('signing aggregateCompleteTransaction by serviceFeePayerAccount');
  const partialSignedAggregateCompleteTransaction = userServiceFeePayerAccount.sign(
    aggregateCompleteTransaction,
    networkGenerationHash,
  );

  // Note: 連署データを保持する配列を初期化する。この後各アカウントで連署データ作る毎に配列に追加していき、全部そろったら改めてトランザクションに連署データをセットする。
  logger.debug('initializing cosignatures');
  const cosignatures = [];

  // Note: 連署1/2
  logger.debug('cosigning 1/2 aggregateCompleteTransaction by userCosigner1Account');
  const cosignedTransactionByUserCosigner1Account = CosignatureTransaction.signTransactionPayload(
    userCosigner1Account,
    partialSignedAggregateCompleteTransaction.payload,
    networkGenerationHash,
  );
  const cosignatureByUserCosigner1Account = new CosignatureSignedTransaction(
    cosignedTransactionByUserCosigner1Account.parentHash,
    cosignedTransactionByUserCosigner1Account.signature,
    cosignedTransactionByUserCosigner1Account.signerPublicKey,
  );
  cosignatures.push(cosignatureByUserCosigner1Account);

  // Note: 連署2/2
  logger.debug('cosigning 2/2 aggregateCompleteTransaction by userCosigner2Account');
  const cosignedTransactionByUserCosigner2Account = CosignatureTransaction.signTransactionPayload(
    userCosigner2Account,
    partialSignedAggregateCompleteTransaction.payload,
    networkGenerationHash,
  );
  const cosignatureByUserCosigner2Account = new CosignatureSignedTransaction(
    cosignedTransactionByUserCosigner2Account.parentHash,
    cosignedTransactionByUserCosigner2Account.signature,
    cosignedTransactionByUserCosigner2Account.signerPublicKey,
  );
  cosignatures.push(cosignatureByUserCosigner2Account);

  // Note: 連署データをトランザクションにセットする
  logger.debug('setting cosignatures to aggregateCompleteTransaction');
  const aggregateCompleteTransactionWithCosignatures = TransactionMapping.createFromPayload(
    partialSignedAggregateCompleteTransaction.payload,
  ) as AggregateTransaction;
  const signedAggregateCompleteTransactionWithCosignatures = userServiceFeePayerAccount.signTransactionGivenSignatures(
    aggregateCompleteTransactionWithCosignatures,
    cosignatures,
    networkGenerationHash,
  );

  // Note: トランザクションのアナウンスに失敗した場合に備え、再アナウンス可能なデータをDBに保存
  const transactionHash = signedAggregateCompleteTransactionWithCosignatures.hash;
  const transactionId = transactionHash;
  const transactionPayload = signedAggregateCompleteTransactionWithCosignatures.payload;
  logger.debug({
    transactionHash,
    // transactionPayload,
  });
  const now = new Date();
  const transaction: PrivateUserFileTransaction = {
    transactionId,
    transactionHash,
    transactionPayload,
    transactionStatus: 'PENDING',
    transactionCreatedAt: now,
    transactionUpdatedAt: now,
    transactionIndex: uploadEncryptedFileChunkInfo.transactionInfo.index,
    transactionLength: uploadEncryptedFileChunkInfo.transactionInfo.length,
    transactionEncryptedChunks: uploadEncryptedFileChunkInfo.transactionInfo.chunks,
  };

  const transactionPath = `/v/1/types/private/users/${uploadEncryptedFileChunkInfo.userId}/files/${uploadEncryptedFileChunkInfo.file.fileId}/transactions/${transactionId}`;
  logger.debug({ transactionPath });

  await db.doc(transactionPath).set(transaction);

  // Note: 1st try to announce
  const nodeUrl = `https://${selectRandomNode()}:3001`;
  logger.debug({ nodeUrl });
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
  const transactionRepository = repositoryFactory.createTransactionRepository();
  const listener = repositoryFactory.createListener();
  const errors = [];
  try {
    await listener.open();
    listener.status(userMultisigAccount.address).subscribe(async (transactionStatusError) => {
      logger.error({ transactionStatusError });
      const error = Error('transaction announce error');
      errors.push(error);
      const transactionStatusUpdate: Partial<AdminUserTransaction> = {
        transactionStatus: 'ERROR',
        transactionUpdatedAt: new Date(),
      };
      await db.doc(transactionPath).set(transactionStatusUpdate, { merge: true });
      throw error;
    });
    listener.unconfirmedAdded(userMultisigAccount.address).subscribe(async (unconfirmedTransaction) => {
      logger.debug({ unconfirmedTransaction });
      const transactionInfo = unconfirmedTransaction.transactionInfo as TransactionInfo;
      const hash = transactionInfo.hash;
      logger.debug({ hash });
      if (hash !== transactionHash) {
        return;
      }
      const transactionStatusUpdate: Partial<AdminUserTransaction> = {
        transactionStatus: 'UNCONFIRMED',
        transactionUpdatedAt: new Date(),
      };
      await db.doc(transactionPath).set(transactionStatusUpdate, { merge: true });
    });
    listener.confirmed(userMultisigAccount.address).subscribe(async (confirmedTransaction) => {
      logger.debug({ confirmedTransaction });
      const transactionInfo = confirmedTransaction.transactionInfo as TransactionInfo;
      const hash = transactionInfo.hash;
      logger.debug({ hash });
      if (hash !== transactionHash) {
        return;
      }
      const now = new Date();
      const transactionStatusUpdate: Partial<AdminUserTransaction> = {
        transactionStatus: 'CONFIRMED',
        transactionUpdatedAt: now,
      };
      await db.doc(transactionPath).set(transactionStatusUpdate, { merge: true });
      listener.close();
    });
    listener.newBlock().subscribe((newBlock) => {
      logger.debug({ newBlock });
    });
    transactionRepository
      .announce(signedAggregateCompleteTransactionWithCosignatures)
      .subscribe((transactionAnnounceResponse) => {
        logger.debug(transactionAnnounceResponse);
      });
  } catch (error) {
    logger.error(error);
    errors.push(error);
    listener.close();
  }

  if (errors.length === 0) {
    logger.debug('success on 1st try');
    logger.debug('sendAggregateCompleteTransactionToUploadEncryptedFileChunk end');
    return;
  }

  logger.error('failed on 1st try');
  logger.error('sendAggregateCompleteTransactionToUploadEncryptedFileChunk end');
};
