import { exportFunctionsModule } from '../../utils/firebase/deploy';

const domains: string[] = ['onCall', 'onRequest'];

domains.forEach((domain) => exportFunctionsModule(['v1', 'https', domain], exports));
