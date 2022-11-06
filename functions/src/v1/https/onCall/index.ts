import { HttpsFunction, Runnable } from 'firebase-functions/lib/cloud-functions';
import { exportFunction } from '../../../utils/firebase/deploy';
import { backupRecoveryKeyFile } from './backupRecoveryKeyFile';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _exportFunction = (name: string, f: () => HttpsFunction & Runnable<any>) =>
  exportFunction(['v1', 'https', 'onCall', name], exports, f);

_exportFunction('backupRecoveryKeyFile', backupRecoveryKeyFile);
