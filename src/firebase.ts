import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDs7YHJbTeaX9xwAqNQc81qqkReiGNPdW8",
  authDomain: "skillfolio-cd0d9.firebaseapp.com",
  projectId: "skillfolio-cd0d9",
  storageBucket: "skillfolio-cd0d9.firebasestorage.app",
  messagingSenderId: "1088339007949",
  appId: "1:1088339007949:web:dbb14d0b6c3c70d5828c84"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable Auth persistence
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Auth persistence error:", error);
});

// Enable Firestore offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.error('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.error('The current browser does not support persistence.');
  }
});

export default app;