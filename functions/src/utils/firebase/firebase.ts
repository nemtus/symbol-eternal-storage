import * as admin from 'firebase-admin';

export const app = admin.initializeApp();
export const db = app.firestore();
export const FieldValue = admin.firestore.FieldValue;
export const Timestamp = admin.firestore.Timestamp;
export const auth = app.auth();
