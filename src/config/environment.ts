/**
 * Single source of truth for configuration.
 * Expo only inlines `process.env.EXPO_PUBLIC_*` when accessed statically, so each variable is
 * referenced by its full name here (never via dynamic lookups).
 * These values ship in the app bundle: they must never be secrets.
 */
import { normalizeDomain } from '../utils/validateEmailDomain';

export const env = {
  allowedEmailDomain: normalizeDomain(process.env.EXPO_PUBLIC_ALLOWED_EMAIL_DOMAIN),
  requireVerifiedEmail: (process.env.EXPO_PUBLIC_REQUIRE_VERIFIED_EMAIL ?? 'true').toLowerCase() !== 'false',
  firebase: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  },
  google: {
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
  },
};

/** Names of required settings that are empty, so the UI can show a clear setup message. */
export function getMissingConfig(): string[] {
  const missing: string[] = [];
  if (!env.allowedEmailDomain) missing.push('EXPO_PUBLIC_ALLOWED_EMAIL_DOMAIN');
  if (!env.firebase.apiKey) missing.push('EXPO_PUBLIC_FIREBASE_API_KEY');
  if (!env.firebase.authDomain) missing.push('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!env.firebase.projectId) missing.push('EXPO_PUBLIC_FIREBASE_PROJECT_ID');
  if (!env.firebase.appId) missing.push('EXPO_PUBLIC_FIREBASE_APP_ID');
  if (!env.google.webClientId) missing.push('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
  return missing;
}

/** Firebase refuses to initialize without an API key; the placeholder lets the UI show a setup message instead of crashing. */
export const firebaseOptions = { ...env.firebase, apiKey: env.firebase.apiKey || 'missing-api-key' };
