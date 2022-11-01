import { getApps, getApp, initializeApp } from 'firebase/app';
import {
  User as AuthUser,
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  connectAuthEmulator,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  onSnapshot,
  connectFirestoreEmulator,
} from 'firebase/firestore';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { getDownloadURL, getStorage, ref, uploadBytes, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleAuthProvider = new GoogleAuthProvider();
const functions = getFunctions(app, 'asia-northeast1');
const storage = getStorage(app);

if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
  connectStorageEmulator(storage, 'localhost', 9199);
}

export {
  auth,
  onAuthStateChanged,
  signInWithRedirect,
  signOut,
  getRedirectResult,
  googleAuthProvider,
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  onSnapshot,
  functions,
  httpsCallable,
  storage,
  ref,
  uploadBytes,
  getDownloadURL,
};
export type { AuthUser };
export default db;
