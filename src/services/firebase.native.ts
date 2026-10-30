// Android / iOS build: persist the session in AsyncStorage so it survives app restarts.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, type Auth, type Persistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseOptions } from '../config/environment';

// The react-native build of firebase/auth exports this; the shared type entry point does not.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getReactNativePersistence } = require('firebase/auth') as {
  getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
};

const app = getApps()[0] ?? initializeApp(firebaseOptions);

function createAuth(): Auth {
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    // Already initialized (fast refresh).
    return getAuth(getApp());
  }
}

export const auth = createAuth();
export const db = getFirestore(app);
