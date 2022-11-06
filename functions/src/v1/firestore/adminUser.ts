import { exportFunction } from '../../utils/firebase/deploy';
import functions from '../../utils/firebase/baseFunction';
import { Change, CloudFunction } from 'firebase-functions/lib/cloud-functions';
import { QueryDocumentSnapshot } from 'firebase-functions/lib/providers/firestore';
import { hasAlreadyTriggered } from '../../utils/firebase/hasAlreadyTriggered';
import { logger } from '../../utils/firebase/logger';
import { AdminUser } from '../models/adminUser';
import { defineSecret } from 'firebase-functions/v2/params';
import { decrypt } from '../../utils/cipher/encrypt';
import {
  CreateAndSetUpNewAccountInfo,
  sendAggregateCompleteTransactionToCreateAndSetUpNewAccount,
} from '../../utils/symbol/transactions/sendAggregateCompleteTransactionToCreateNewAccount';
import { convertAdminUserToPrivateUser } from '../models/privateUser';
import { db } from '../../utils/firebase/firebase';

const SERVICE_FEE_PAYER_ACCOUNT_PRIVATE_KEY = defineSecret('SERVICE_FEE_PAYER_ACCOUNT_PRIVATE_KEY');
const SERVICE_ENCRYPT_KEY = defineSecret('SERVICE_ENCRYPT_KEY');

const _exportFunction = (
  name: string,
  f: () => CloudFunction<QueryDocumentSnapshot> | CloudFunction<Change<QueryDocumentSnapshot>>,
) => exportFunction(['v1', 'firestore', 'adminUser', name], exports, f);

const path = '/v/1/types/admin/users/{userID}';

_exportFunction('onCreate', () =>
  functions()
    .runWith({
      secrets: ['SERVICE_FEE_PAYER_ACCOUNT_PRIVATE_KEY', 'SERVICE_ENCRYPT_KEY'],
      timeoutSeconds: 240,
    })
    .firestore.document(path)
    .onCreate(async (snapshot, context) => {
      if (await hasAlreadyTriggered(context.eventId, 'v1-firestore-adminUser-onCreate')) {
        return;
      }
      logger.debug({ snapshot, context });

      const adminUser = snapshot.data() as AdminUser;
      logger.debug({ adminUser });

      const userId = adminUser.userId;
      logger.debug({ userId });

      logger.debug('Decrypting...');
      const userServiceFeePayerAccountPrivateKeyString = SERVICE_FEE_PAYER_ACCOUNT_PRIVATE_KEY.value();
      const userServiceStorageAccountPublicKeyString = adminUser.userServiceStorageAccountPublicKeyString;
      const serviceEncryptKey = SERVICE_ENCRYPT_KEY.value();
      const userMultisigAccountPrivateKeyString = decrypt(
        adminUser.userMultisigAccountPrivateKeyEncryptedString,
        serviceEncryptKey,
        adminUser.userSaltHexString,
        adminUser.userIvHexString,
      );
      const userCosigner1AccountPrivateKeyString = decrypt(
        adminUser.userCosigner1AccountPrivateKeyEncryptedString,
        serviceEncryptKey,
        adminUser.userSaltHexString,
        adminUser.userIvHexString,
      );
      const userCosigner2AccountPrivateKeyString = decrypt(
        adminUser.userCosigner2AccountPrivateKeyEncryptedString,
        serviceEncryptKey,
        adminUser.userSaltHexString,
        adminUser.userIvHexString,
      );
      const userCosigner3AccountPrivateKeyString = decrypt(
        adminUser.userCosigner3AccountPrivateKeyEncryptedString,
        serviceEncryptKey,
        adminUser.userSaltHexString,
        adminUser.userIvHexString,
      );
      logger.debug('Decrypted');

      const createAndSetUpNewAccountInfo: CreateAndSetUpNewAccountInfo = {
        userId,
        userServiceFeePayerAccountPrivateKeyString,
        userServiceStorageAccountPublicKeyString,
        userMultisigAccountPrivateKeyString,
        userCosigner1AccountPrivateKeyString,
        userCosigner2AccountPrivateKeyString,
        userCosigner3AccountPrivateKeyString,
      };

      await sendAggregateCompleteTransactionToCreateAndSetUpNewAccount(createAndSetUpNewAccountInfo);
    }),
);

_exportFunction('onUpdate', () =>
  functions()
    .firestore.document(path)
    .onUpdate(async (changeSnapshot, context) => {
      if (await hasAlreadyTriggered(context.eventId, 'v1-firestore-adminUser-onUpdate')) {
        return;
      }
      logger.debug({ changeSnapshot, context });

      const afterAdminUserUpdate = changeSnapshot.after.data();
      afterAdminUserUpdate.userUpdatedAt = changeSnapshot.after.updateTime.toDate();

      const privateUser = convertAdminUserToPrivateUser(afterAdminUserUpdate as AdminUser);
      await db.doc(`/v/1/types/private/users/${privateUser.userId}`).set(privateUser, { merge: true });
    }),
);
