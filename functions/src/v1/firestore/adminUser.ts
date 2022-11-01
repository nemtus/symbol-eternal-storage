import { exportFunction } from '../../utils/firebase/deploy';
import functions from '../../utils/firebase/baseFunction';
import { Change, CloudFunction } from 'firebase-functions/lib/cloud-functions';
import { QueryDocumentSnapshot } from 'firebase-functions/lib/providers/firestore';
import { hasAlreadyTriggered } from '../../utils/firebase/hasAlreadyTriggered';
import { logger } from '../../utils/firebase/logger';

const _exportFunction = (
  name: string,
  f: () => CloudFunction<QueryDocumentSnapshot> | CloudFunction<Change<QueryDocumentSnapshot>>,
) => exportFunction(['v1', 'firestore', 'adminUser', name], exports, f);

const path = '/v/1/types/admin/users/{userID}';

_exportFunction('onCreate', () =>
  functions()
    .firestore.document(path)
    .onCreate(async (snapshot, context) => {
      if (await hasAlreadyTriggered(context.eventId, 'v1-firestore-adminUser-onCreate')) {
        return;
      }
      logger.debug({ snapshot, context });
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
    }),
);
