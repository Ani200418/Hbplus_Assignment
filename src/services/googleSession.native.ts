import { GoogleSignin } from '@react-native-google-signin/google-signin';

/** Clears the native Google account so the next sign-in shows the account chooser. */
export async function clearGoogleSession(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch {
    // Nothing to clear.
  }
}
