export interface PrivateUserTransaction {
  transactionId: string;
  transactionHash: string;
  transactionPayload: string;
  transactionStatus: 'PENDING' | 'UNCONFIRMED' | 'CONFIRMED' | 'ERROR';
  transactionCreatedAt: Date;
  transactionUpdatedAt: Date;
}
