// Android/iOS implementation: native Google account picker -> Google ID token -> Firebase credential.
// Requires a development build (not Expo Go) because it uses native modules.
import { GoogleSignin, isErrorWithCode, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { useCallback, useState } from 'react';
import { env } from '../config/environment';
import { describeAuthError, isCancellation, signInWithGoogleIdToken } from '../services/auth';
import { useAuth } from './useAuth';

let configured = false;
function ensureConfigured() {
  if (configured) return;
  GoogleSignin.configure({
    webClientId: env.google.webClientId,
    iosClientId: env.google.iosClientId || undefined,
    hostedDomain: env.allowedEmailDomain || undefined, // account-chooser hint only
  });
  configured = true;
}

export function useGoogleSignIn() {
  const { clearAccessError } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async () => {
    setError(null);
    clearAccessError();
    setPending(true);
    try {
      ensureConfigured();
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // Always show the account chooser so a rejected user can pick a different account.
      await GoogleSignin.signOut().catch(() => undefined);
      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) return; // cancelled
      const idToken = response.data.idToken;
      if (!idToken) throw new Error('missing-id-token');
      await signInWithGoogleIdToken(idToken);
    } catch (e) {
      const cancelled = isErrorWithCode(e) && isCancellation(e);
      if (!cancelled) setError(describeAuthError(e));
    } finally {
      setPending(false);
    }
  }, [clearAccessError]);

  return { signIn, pending, error };
}
