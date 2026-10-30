import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { AppUser, UserRole } from '../types/auth';

/**
 * Creates the profile on first login (role is always "user" - Firestore rules reject anything else)
 * and refreshes mutable fields afterwards. Returns the role stored on the server.
 * Failure here must not break login, so callers treat errors as non-fatal.
 */
export async function syncUserProfile(user: AppUser): Promise<UserRole> {
  const ref = doc(db, 'users', user.uid);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: 'user',
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
    return 'user';
  }
  await updateDoc(ref, {
    displayName: user.displayName,
    photoURL: user.photoURL,
    lastLoginAt: serverTimestamp(),
  });
  return snapshot.data().role === 'admin' ? 'admin' : 'user';
}
