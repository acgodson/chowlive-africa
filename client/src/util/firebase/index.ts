import { FirebaseApp, getApp, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';

export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBYB3vDonVETJ8qZtxUkr0q8eSk8NYBhXk',
  authDomain: 'chow-live.firebaseapp.com',
  databaseURL: 'https://chow-live-default-rtdb.firebaseio.com',
  projectId: 'chow-live',
  storageBucket: 'chow-live.appspot.com',
  messagingSenderId: '1011180450496',
  appId: '1:1011180450496:web:30535474d7f7b69822f325',
  measurementId: 'G-GWCYMV0MZ5',
};

let app: FirebaseApp;
let db: Firestore;

export const initializeFirebase = (): FirebaseApp => {
  try {
    app = getApp();
  } catch {
    app = initializeApp(FIREBASE_CONFIG);
  }
  db = getFirestore(app);
  return app;
};

export const getFirebaseApp = (): FirebaseApp => {
  if (!app) {
    initializeFirebase();
  }
  return app;
};

export const getFirestoreDB = (): Firestore => {
  if (!db) {
    initializeFirebase();
  }
  return db;
};
