import { GoogleAuthProvider, type Auth, type AuthProvider } from 'firebase/auth';
import { env } from '../config/environment';
import { auth } from './firebase';

// Popup/redirect flows exist only in the web build of firebase/auth, whose types are not
// selected under the react-native resolution condition Expo's tsconfig uses.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const web = require('firebase/auth') as {
  signInWithPopup: (auth: Auth, provider: AuthProvider) => Promise<unknown>;
  signInWithRedirect: (auth: Auth, provider: AuthProvider) => Promise<never>;
};

/**
 * Google sign-in for browsers. `hd` only pre-filters Google's account chooser; it is a hint,
 * not a security control. The real check runs on the Firebase user after sign-in.
 */
export async function signInWithGoogleWeb(): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account', ...(env.allowedEmailDomain ? { hd: env.allowedEmailDomain } : {}) });
  try {
    await web.signInWithPopup(auth, provider);
  } catch (error) {
    // Popups can be blocked (e.g. some in-app browsers); a redirect works everywhere.
    if ((error as { code?: string }).code === 'auth/popup-blocked') {
      await web.signInWithRedirect(auth, provider);
      return;
    }
    throw error;
  }
}
