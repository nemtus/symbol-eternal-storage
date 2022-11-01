import functions from '../../../utils/firebase/baseFunction';
import { logger } from '../../../utils/firebase/logger';

export const helloWorld = () =>
  functions().https.onRequest(async (request, response) => {
    logger.debug({ request });
    logger.debug('Hello World!');
    response.send('Hello from Firebase!');
  });
