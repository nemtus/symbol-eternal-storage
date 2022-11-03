import { exportFunctionsModule } from '../../utils/firebase/deploy';

const domains = ['adminUser', 'adminUserTransaction'];

domains.forEach((domain) => exportFunctionsModule(['v1', 'firestore', domain], exports));
