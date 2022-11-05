import db, { collection, doc } from '../../firebase';

export const snapshotListenOptions = { includeMetadataChanges: true };

export const adminUserCollection = collection(db, '/v/1/types/admin/users');
export const adminUserDoc = (userId: string) => doc(db, `/v/1/types/admin/users/${userId}`);
export const adminUserTransactionCollection = (userId: string) =>
  collection(db, `/v/1/types/admin/users/${userId}/transactions`);
export const adminUserTransactionDoc = (userId: string, transactionId: string) =>
  doc(db, `/v/1/types/admin/users/${userId}/transactions/${transactionId}`);
export const adminUserFileCollection = (userId: string) => collection(db, `/v/1/types/admin/users/${userId}/files`);
export const adminUserFileDoc = (userId: string, fileId: string) =>
  doc(db, `/v/1/types/admin/users/${userId}/files/${fileId}`);

export const privateUserDoc = (userId: string) => doc(db, `/v/1/types/private/users/${userId}`);
export const privateUserTransactionCollection = (userId: string) =>
  collection(db, `/v/1/types/private/users/${userId}/transactions`);
export const privateUserTransactionDoc = (userId: string, transactionId: string) =>
  doc(db, `/v/1/types/private/users/${userId}/transactions/${transactionId}`);
export const privateUserFileCollection = (userId: string) => collection(db, `/v/1/types/private/users/${userId}/files`);
export const privateUserFileDoc = (userId: string, fileId: string) =>
  doc(db, `/v/1/types/private/users/${userId}/files/${fileId}`);
