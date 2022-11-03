import { exportFunction } from '../../utils/firebase/deploy';
import functions from '../../utils/firebase/baseFunction';
import { Change, CloudFunction } from 'firebase-functions/lib/cloud-functions';
import { QueryDocumentSnapshot } from 'firebase-functions/lib/providers/firestore';
import { hasAlreadyTriggered } from '../../utils/firebase/hasAlreadyTriggered';
import { logger } from '../../utils/firebase/logger';
import { db } from '../../utils/firebase/firebase';
import { PrivateUserTransaction } from '../models/privateUserTransaction';
import { AdminUserTransaction } from '../models/adminUserTransaction';

const _exportFunction = (
  name: string,
  f: () => CloudFunction<QueryDocumentSnapshot> | CloudFunction<Change<QueryDocumentSnapshot>>,
) => exportFunction(['v1', 'firestore', 'adminUserTransaction', name], exports, f);

const path = '/v/1/types/admin/users/{userID}/transactions/{transactionId}';

_exportFunction('onCreate', () =>
  functions()
    .firestore.document(path)
    .onCreate(async (snapshot, context) => {
      if (await hasAlreadyTriggered(context.eventId, 'v1-firestore-adminUserTransaction-onCreate')) {
        return;
      }
      logger.debug({ snapshot, context });

      const adminUserTransaction = snapshot.data();
      logger.debug({ adminUserTransaction });

      const privateUserTransaction = adminUserTransaction as PrivateUserTransaction;
      logger.debug({ privateUserTransaction });

      await db
        .doc(`/v/1/types/private/users/${context.params.userID}/transactions/${context.params.transactionId}`)
        .set(privateUserTransaction);
    }),
);

_exportFunction('onUpdate', () =>
  functions()
    .firestore.document(path)
    .onUpdate(async (changeSnapshot, context) => {
      if (await hasAlreadyTriggered(context.eventId, 'v1-firestore-adminUserTransaction-onUpdate')) {
        return;
      }
      logger.debug({ changeSnapshot, context });

      const afterAdminUserTransactionUpdate = changeSnapshot.after.data();
      afterAdminUserTransactionUpdate.transactionUpdatedAt = changeSnapshot.after.updateTime.toDate();
      logger.debug({ afterAdminUserTransactionUpdate });

      const privateUserTransaction = afterAdminUserTransactionUpdate as AdminUserTransaction;
      logger.debug({ privateUserTransaction });

      await db
        .doc(`/v/1/types/private/users/${context.params.userID}/transactions/${context.params.transactionId}`)
        .set(privateUserTransaction, { merge: true });
    }),
);
