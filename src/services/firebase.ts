// Web build: the Firebase JS SDK persists the session in IndexedDB by default.
import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseOptions } from '../config/environment';

const app = getApps()[0] ?? initializeApp(firebaseOptions);

export const auth = getAuth(app);
export const db = getFirestore(app);
