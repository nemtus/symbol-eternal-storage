import { exportFunction } from '../../utils/firebase/deploy';
import functions from '../../utils/firebase/baseFunction';
import { hasAlreadyTriggered } from '../../utils/firebase/hasAlreadyTriggered';
import { UserRecord } from 'firebase-functions/lib/common/providers/identity';
import { CloudFunction } from 'firebase-functions/lib/cloud-functions';
import { logger } from '../../utils/firebase/logger';
import { db } from '../../utils/firebase/firebase';
import { defineSecret } from 'firebase-functions/v2/params';
import {
  convertPrivateKeyStringToPublicKeyString,
  convertPublicKeyStringToAddressString,
  createNewPrivateKeyString,
} from '../../utils/symbol/key';
import { createIvHexString, createSaltHexString, encrypt } from '../../utils/cipher/encrypt';
import { AdminUser } from '../models/adminUser';
import { convertAdminUserToPrivateUser, PrivateUser } from '../models/privateUser';

const SERVICE_FEE_PAYER_ACCOUNT_PRIVATE_KEY = defineSecret('SERVICE_FEE_PAYER_ACCOUNT_PRIVATE_KEY');
const SERVICE_STORAGE_ACCOUNT_PRIVATE_KEY = defineSecret('SERVICE_STORAGE_ACCOUNT_PRIVATE_KEY');
const SERVICE_ENCRYPT_KEY = defineSecret('SERVICE_ENCRYPT_KEY');

const _exportFunction = (name: string, f: () => CloudFunction<UserRecord>) =>
  exportFunction(['v1', 'auth', name], exports, f);

_exportFunction('onCreate', () =>
  functions()
    .runWith({
      secrets: ['SERVICE_FEE_PAYER_ACCOUNT_PRIVATE_KEY', 'SERVICE_STORAGE_ACCOUNT_PRIVATE_KEY', 'SERVICE_ENCRYPT_KEY'],
    })
    .auth.user()
    .onCreate(async (userRecord, context) => {
      if (await hasAlreadyTriggered(context.eventId, 'v1-auth-onCreate')) {
        return;
      }

      logger.debug({
        userRecord,
        context,
      });

      const userId = userRecord.uid;
      const userDisplayName = userRecord.displayName ?? '';
      const userPhotoUrl = userRecord.photoURL ?? '';

      const symbolNetworkName = process.env.SYMBOL_NETWORK_NAME;
      if (symbolNetworkName !== 'testnet' && symbolNetworkName !== 'mainnet') {
        throw Error('Invalid network name');
      }

      const userSaltHexString = createSaltHexString();
      const userIvHexString = createIvHexString();
      const password = SERVICE_ENCRYPT_KEY.value();

      const serviceFeePayerAccountPrivateKeyString = SERVICE_FEE_PAYER_ACCOUNT_PRIVATE_KEY.value();
      const userServiceFeePayerAccountPublicKeyString = convertPrivateKeyStringToPublicKeyString(
        serviceFeePayerAccountPrivateKeyString,
      );
      const userServiceFeePayerAccountAddressString = convertPublicKeyStringToAddressString(
        userServiceFeePayerAccountPublicKeyString,
        symbolNetworkName,
      );

      const userServiceStorageAccountPrivateKeyString = SERVICE_STORAGE_ACCOUNT_PRIVATE_KEY.value();
      const userServiceStorageAccountPublicKeyString = convertPrivateKeyStringToPublicKeyString(
        userServiceStorageAccountPrivateKeyString,
      );
      const userServiceStorageAccountAddressString = convertPublicKeyStringToAddressString(
        userServiceStorageAccountPublicKeyString,
        symbolNetworkName,
      );

      const userMultisigAccountPrivateKeyString = createNewPrivateKeyString();
      const userMultisigAccountPrivateKeyEncryptedString = encrypt(
        userMultisigAccountPrivateKeyString,
        password,
        userSaltHexString,
        userIvHexString,
      );
      const userMultisigAccountPublicKeyString = convertPrivateKeyStringToPublicKeyString(
        userMultisigAccountPrivateKeyString,
      );
      const userMultisigAccountAddressString = convertPublicKeyStringToAddressString(
        userMultisigAccountPublicKeyString,
        symbolNetworkName,
      );

      const userCosigner1AccountPrivateKeyString = createNewPrivateKeyString();
      const userCosigner1AccountPrivateKeyEncryptedString = encrypt(
        userCosigner1AccountPrivateKeyString,
        password,
        userSaltHexString,
        userIvHexString,
      );
      const userCosigner1AccountPublicKeyString = convertPrivateKeyStringToPublicKeyString(
        userCosigner1AccountPrivateKeyString,
      );
      const userCosigner1AccountAddressString = convertPublicKeyStringToAddressString(
        userCosigner1AccountPublicKeyString,
        symbolNetworkName,
      );

      const userCosigner2AccountPrivateKeyString = createNewPrivateKeyString();
      const userCosigner2AccountPrivateKeyEncryptedString = encrypt(
        userCosigner2AccountPrivateKeyString,
        password,
        userSaltHexString,
        userIvHexString,
      );
      const userCosigner2AccountPublicKeyString = convertPrivateKeyStringToPublicKeyString(
        userCosigner2AccountPrivateKeyString,
      );
      const userCosigner2AccountAddressString = convertPublicKeyStringToAddressString(
        userCosigner2AccountPublicKeyString,
        symbolNetworkName,
      );

      const userCosigner3AccountPrivateKeyString = createNewPrivateKeyString();
      const userCosigner3AccountPrivateKeyEncryptedString = encrypt(
        userCosigner3AccountPrivateKeyString,
        password,
        userSaltHexString,
        userIvHexString,
      );
      const userCosigner3AccountPublicKeyString = convertPrivateKeyStringToPublicKeyString(
        userCosigner3AccountPrivateKeyString,
      );
      const userCosigner3AccountAddressString = convertPublicKeyStringToAddressString(
        userCosigner3AccountPublicKeyString,
        symbolNetworkName,
      );

      const userMultisigAccountModified = false;
      const userAccountRestricted = false;
      const userAccountPrepared = false;
      const now = new Date();
      const userCreatedAt = now;
      const userUpdatedAt = now;

      const adminUser: AdminUser = {
        userId,
        userDisplayName,
        userPhotoUrl,
        userSaltHexString,
        userIvHexString,
        userServiceFeePayerAccountPublicKeyString,
        userServiceFeePayerAccountAddressString,
        userServiceStorageAccountPublicKeyString,
        userServiceStorageAccountAddressString,
        userMultisigAccountModified,
        userAccountRestricted,
        userAccountPrepared,
        userMultisigAccountPrivateKeyEncryptedString,
        userMultisigAccountPublicKeyString,
        userMultisigAccountAddressString,
        userCosigner1AccountPrivateKeyEncryptedString,
        userCosigner1AccountPublicKeyString,
        userCosigner1AccountAddressString,
        userCosigner2AccountPrivateKeyEncryptedString,
        userCosigner2AccountPublicKeyString,
        userCosigner2AccountAddressString,
        userCosigner3AccountPrivateKeyEncryptedString,
        userCosigner3AccountPublicKeyString,
        userCosigner3AccountAddressString,
        userCreatedAt,
        userUpdatedAt,
      };
      logger.debug({ adminUser });
      await db.doc(`v/1/types/admin/users/${userId}`).set(adminUser);

      const privateUser: PrivateUser = convertAdminUserToPrivateUser(adminUser);
      logger.debug({ privateUser });
      await db.doc(`v/1/types/private/users/${userId}`).set(privateUser);
    }),
);
