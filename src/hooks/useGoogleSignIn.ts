// Web implementation (Firebase popup). Android/iOS use useGoogleSignIn.native.ts.
import { useCallback, useState } from 'react';
import { describeAuthError, isCancellation } from '../services/auth';
import { signInWithGoogleWeb } from '../services/googleWeb';
import { useAuth } from './useAuth';

export function useGoogleSignIn() {
  const { clearAccessError } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async () => {
    setError(null);
    clearAccessError();
    setPending(true);
    try {
      await signInWithGoogleWeb();
    } catch (e) {
      if (!isCancellation(e)) setError(describeAuthError(e));
    } finally {
      setPending(false);
    }
  }, [clearAccessError]);

  return { signIn, pending, error };
}
