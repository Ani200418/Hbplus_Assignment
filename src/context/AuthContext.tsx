import { onAuthStateChanged } from 'firebase/auth';
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getMissingConfig } from '../config/environment';
import { auth } from '../services/firebase';
import { checkUserAccess, signOutUser, toAppUser } from '../services/auth';
import { syncUserProfile } from '../services/userProfile';
import { ACCESS_DENIED_MESSAGE, type AppUser, type AuthStatus, type UserRole } from '../types/auth';

export interface AuthContextValue {
  status: AuthStatus;
  user: AppUser | null;
  role: UserRole;
  /** Set when a Google account was rejected by the access policy. */
  accessError: string | null;
  clearAccessError: () => void;
  logout: () => Promise<void>;
  /** Names of missing required settings (empty when the app is configured). */
  missingConfig: string[];
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const missingConfig = useMemo(() => getMissingConfig(), []);
  const [resolvedStatus, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AppUser | null>(null);
  const [role, setRole] = useState<UserRole>('user');
  const [accessError, setAccessError] = useState<string | null>(null);

  useEffect(() => {
    if (missingConfig.length > 0) return; // nothing to listen to without Firebase settings
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!active) return;
      if (!firebaseUser) {
        setUser(null);
        setRole('user');
        setStatus('unauthenticated');
        return;
      }
      // The single place access is granted: decided from the Firebase identity, before anything renders.
      const decision = checkUserAccess(firebaseUser);
      if (!decision.allowed) {
        setUser(null);
        setRole('user');
        setAccessError(ACCESS_DENIED_MESSAGE);
        setStatus('unauthenticated');
        signOutUser().catch(() => undefined);
        return;
      }
      const appUser = toAppUser(firebaseUser);
      setAccessError(null);
      setUser(appUser);
      setStatus('authenticated');
      // Profile storage is best effort; the Firestore rules, not this call, protect the data.
      syncUserProfile(appUser)
        .then((storedRole) => active && setRole(storedRole))
        .catch(() => undefined);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [missingConfig]);

  // Without configuration there is no session to restore, so the login screen can show setup help.
  const status: AuthStatus = missingConfig.length > 0 ? 'unauthenticated' : resolvedStatus;

  const clearAccessError = useCallback(() => setAccessError(null), []);

  const logout = useCallback(async () => {
    setUser(null);
    setRole('user');
    setStatus('unauthenticated');
    await signOutUser();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, role, accessError, clearAccessError, logout, missingConfig }),
    [status, user, role, accessError, clearAccessError, logout, missingConfig],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
