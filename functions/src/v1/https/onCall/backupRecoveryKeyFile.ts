import baseFunctions from '../../../utils/firebase/baseFunction';
import * as functions from 'firebase-functions';
import { defineSecret } from 'firebase-functions/v2/params';
import { decrypt } from '../../../utils/cipher/encrypt';
import { logger } from '../../../utils/firebase/logger';
import { auth, db } from '../../../utils/firebase/firebase';
import { AdminUser } from '../../models/adminUser';

const SERVICE_ENCRYPT_KEY = defineSecret('SERVICE_ENCRYPT_KEY');

export const backupRecoveryKeyFile = () =>
  baseFunctions()
    .runWith({
      secrets: ['SERVICE_ENCRYPT_KEY'],
    })
    .https.onCall(async (data, context) => {
      logger.debug({ data });
      logger.debug({ context });

      const userId = context?.auth?.uid;
      if (!userId) {
        throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
      }
      const authUser = await auth.getUser(userId);
      if (userId != authUser.uid) {
        throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
      }

      const adminUser = (await db.doc(`/v/1/types/admin/users/${userId}`).get()).data() as AdminUser;
      logger.debug({ adminUser });

      const serviceEncryptKey = SERVICE_ENCRYPT_KEY.value();
      logger.debug({ salt: adminUser.userSaltHexString });
      const userMultisigAccountPrivateKeyString = decrypt(
        adminUser.userMultisigAccountPrivateKeyEncryptedString,
        serviceEncryptKey,
        adminUser.userSaltHexString,
        adminUser.userIvHexString,
      );

      const response = {
        userMultisigAccountPrivateKey: userMultisigAccountPrivateKeyString,
        serviceFeePayerAccountAddress: adminUser.userServiceFeePayerAccountAddressString,
        serviceStorageAccountPublicKey: adminUser.userServiceStorageAccountPublicKeyString,
      };

      return response;
    });
