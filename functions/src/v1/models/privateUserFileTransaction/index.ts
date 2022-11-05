import { PrivateUserFileChunk } from '../privateUserFileChunk';

export { PrivateUserTransaction as PrivateUserFileTransaction } from '../privateUserTransaction';
export interface PrivateUserFileTransactionInfo {
  index: number;
  length: number;
  chunks: PrivateUserFileChunk[];
}
