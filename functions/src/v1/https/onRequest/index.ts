import { HttpsFunction } from 'firebase-functions/lib/cloud-functions';
import { exportFunction } from '../../../utils/firebase/deploy';
import { helloWorld } from './helloWorld';

const _exportFunction = (name: string, f: () => HttpsFunction) =>
  exportFunction(['v1', 'https', 'onRequest', name], exports, f);

_exportFunction('helloWorld', helloWorld);
