import { exportFunctionsModule } from '../utils/firebase/deploy';

const domains = ['auth', 'firestore', 'storage', 'https'];

domains.forEach((domain) => exportFunctionsModule(['v1', domain], exports));
