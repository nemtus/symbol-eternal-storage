import { exportFunction } from '../../utils/firebase/deploy';
import functions from '../../utils/firebase/baseFunction';
import { CloudFunction } from 'firebase-functions/lib/cloud-functions';
import { ObjectMetadata } from 'firebase-functions/lib/providers/storage';
import { hasAlreadyTriggered } from '../../utils/firebase/hasAlreadyTriggered';
import { logger } from '../../utils/firebase/logger';

const _exportFunction = (name: string, f: () => CloudFunction<ObjectMetadata>) =>
  exportFunction(['v1', 'storage', name], exports, f);

_exportFunction('onFinalize', () =>
  functions()
    .storage.object()
    .onFinalize(async (object, context) => {
      if (await hasAlreadyTriggered(context.eventId, 'v1-storage-onFinalize')) {
        return;
      }
      logger.debug({ object, context });
    }),
);
