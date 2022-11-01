import { exportFunctionsModule } from './utils/firebase/deploy';

const domains = ['v1'];

domains.forEach((domain) => exportFunctionsModule([domain], exports));
