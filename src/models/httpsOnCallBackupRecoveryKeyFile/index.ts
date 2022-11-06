export interface HttpsOnCallBackupRecoveryKeyFileRequest {
  userId: string;
}

export interface HttpsOnCallBackupRecoveryKeyFileResponse {
  userMultisigAccountPrivateKey: string;
  serviceFeePayerAccountAddress: string;
  serviceStorageAccountPublicKey: string;
}
