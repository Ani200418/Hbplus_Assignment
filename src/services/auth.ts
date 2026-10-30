import { GoogleAuthProvider, signInWithCredential, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { env } from '../config/environment';
import type { AppUser } from '../types/auth';
import { evaluateAccess, type PolicyResult } from '../utils/accessPolicy';
import { auth } from './firebase';
import { clearGoogleSession } from './googleSession';

/** Evaluates the access policy against the identity Firebase itself reports. */
export function checkUserAccess(user: User): PolicyResult {
  return evaluateAccess(
    {
      email: user.email,
      emailVerified: user.emailVerified,
      providerIds: user.providerData.map((p) => p.providerId),
    },
    { allowedDomain: env.allowedEmailDomain, requireVerifiedEmail: env.requireVerifiedEmail },
  );
}

/** Keeps only what the app needs. */
export function toAppUser(user: User): AppUser {
  return {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

/** Exchanges a Google ID token (native flow) for a Firebase session. */
export async function signInWithGoogleIdToken(idToken: string): Promise<void> {
  await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
}

export async function signOutUser(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } finally {
    await clearGoogleSession();
  }
}

const MESSAGES: Record<string, string> = {
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
  'auth/cancelled-popup-request': 'Sign-in was cancelled.',
  'auth/popup-blocked': 'Your browser blocked the sign-in window. Allow pop-ups for this site and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
  'auth/unauthorized-domain': 'This site is not authorized for sign-in. Add it under Firebase Authentication settings.',
  'auth/operation-not-allowed': 'Google sign-in is not enabled for this project yet.',
  'auth/invalid-api-key': 'The app is missing valid Firebase settings.',
};

/** True when the person simply dismissed the sign-in prompt. */
export function isCancellation(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  return code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request' || code === 'SIGN_IN_CANCELLED' || code === '12501';
}

/** Maps SDK errors to friendly text without leaking tokens or internals. */
export function describeAuthError(error: unknown): string {
  const code = (error as { code?: string } | null)?.code;
  return (code && MESSAGES[code]) || 'Sign-in failed. Please try again.';
}
