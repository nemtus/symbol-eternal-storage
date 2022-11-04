import db, { collection, doc } from '../../firebase';

export const snapshotListenOptions = { includeMetadataChanges: true };

export const adminUserCollection = collection(db, '/v/1/types/admin/users');
export const adminUserDoc = (userId: string) => doc(db, `/v/1/types/admin/users/${userId}`);
export const adminUserTransactionCollection = (userId: string) =>
  collection(db, `/v/1/types/admin/users/${userId}/transactions`);
export const adminUserTransactionDoc = (userId: string, transactionId: string) =>
  doc(db, `/v/1/types/admin/users/${userId}/transactions/${transactionId}`);
export const privateUserDoc = (userId: string) => doc(db, `/v/1/types/private/users/${userId}`);
export const privateUserTransactionCollection = (userId: string) =>
  collection(db, `/v/1/types/private/users/${userId}/transactions`);
export const privateUserTransactionDoc = (userId: string, transactionId: string) =>
  doc(db, `/v/1/types/private/users/${userId}/transactions/${transactionId}`);
