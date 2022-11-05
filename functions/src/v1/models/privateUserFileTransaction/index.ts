import { PrivateUserFileChunk } from '../privateUserFileChunk';
import { PrivateUserTransaction } from '../privateUserTransaction';

export interface PrivateUserFileTransaction extends PrivateUserTransaction {
  transactionIndex: number;
  transactionLength: number;
  transactionEncryptedChunks: PrivateUserFileChunk[];
}

export interface PrivateUserFileTransactionInfo {
  index: number;
  length: number;
  chunks: PrivateUserFileChunk[];
}
