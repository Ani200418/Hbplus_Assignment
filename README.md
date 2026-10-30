# HB+ Access: Domain-Restricted Google Sign-In (Expo, React Native Web, Firebase)

A single TypeScript codebase for **web, Android and iOS**. Users sign in with Google through Firebase Authentication, and only verified accounts on one approved email domain (default `hbplus.fit`) can reach the dashboard.

## 1. Features
- Google sign-in: Firebase popup on web, native Google account picker on Android/iOS
- Exact, case-insensitive domain check, configured only through `EXPO_PUBLIC_ALLOWED_EMAIL_DOMAIN`
- Rejected accounts are signed out immediately and see: **"Access restricted. Please login using your official domain email."**, with a "Try a different Google account" button
- Protected route group, loading gate while the session restores, logout
- Firestore profile storage (`users/{uid}`) with Security Rules that enforce the same domain policy server-side
- Default `user` role; `admin` can only be granted server-side (custom claim)

## 2. Tech stack
Expo SDK 58, Expo Router, React Native + React Native Web, TypeScript, Firebase JS SDK (Auth + Firestore), `@react-native-google-signin/google-signin` (native), AsyncStorage session persistence (native), Jest + jest-expo + Testing Library.

## 3. Prerequisites
Node 20+, npm, a Firebase project, Android Studio and/or Xcode (macOS) for native builds. **Native sign-in does not run in Expo Go**; it needs a development build.

## 4. Project structure
```text
src/app/            Routes: _layout, index, login, (protected)/{_layout,dashboard}
src/components/     BrandMark, GoogleSignInButton, LoadingScreen, ErrorMessage
src/context/        AuthContext (the single place access is granted or denied)
src/hooks/          useAuth, useGoogleSignIn (.ts = web, .native.ts = Android/iOS)
src/services/       firebase(.native).ts, auth.ts, googleWeb.ts, googleSession(.native).ts, userProfile.ts
src/utils/          validateEmailDomain.ts, accessPolicy.ts
src/config/         environment.ts
tests/              Jest tests
firestore.rules     Firestore Security Rules
app.config.ts       Dynamic Expo config (derives the iOS URL scheme from the iOS client ID)
```

## 5. Install
```bash
npm install
cp .env.example .env   # then fill it in
```

## 6. Environment variables
All `EXPO_PUBLIC_*` values are **bundled into the app and public**. Never put secrets, client secrets or service-account keys in them.

| Variable | Where to get it |
|---|---|
| `EXPO_PUBLIC_ALLOWED_EMAIL_DOMAIN` | Your organization domain, e.g. `hbplus.fit` |
| `EXPO_PUBLIC_REQUIRE_VERIFIED_EMAIL` | `true` (default, recommended) |
| `EXPO_PUBLIC_FIREBASE_*` | Firebase console → Project settings → Your apps → Web app config |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google Cloud → APIs & Services → Credentials → OAuth client of type **Web** (Firebase auto-creates one) |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google Cloud → Credentials → OAuth client of type **iOS** |

If required values are missing, the login screen lists them and disables the button instead of crashing.

## 7. Firebase setup
1. Create a Firebase project, add a **Web app**, and copy its config into `.env`.
2. **Authentication → Sign-in method → Google → Enable.**
3. **Authentication → Settings → Authorized domains**: add every domain that serves the web app (`localhost` is there by default).
4. **Firestore Database → Create database**, then deploy the rules (section 12).

## 8. Google Cloud OAuth clients
- **Web**: use the Web client ID. If you create your own web client, add `https://<project>.firebaseapp.com/__/auth/handler` as an authorized redirect URI and your site origin as an authorized JavaScript origin.
- **Android**: in Firebase project settings add an Android app with package `com.hbplus.access` (change it in `app.config.ts` if needed) and the **SHA-1** of your debug/release keystore. Android sign-in still uses the **Web client ID** to obtain the ID token.
- **iOS**: add an iOS app with bundle ID `com.hbplus.access`, then put the iOS OAuth client ID in `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`. `app.config.ts` converts it to the reverse-client-ID URL scheme automatically.
- On the OAuth consent screen, user type **Internal** (Google Workspace) also limits sign-in to your organization at Google's level.

## 9. Allowed domain
Set `EXPO_PUBLIC_ALLOWED_EMAIL_DOMAIN` in `.env`. **Also update the domain in `firestore.rules`** (`isOrgMember()`), because rules cannot read environment variables.

## 10. Run
```bash
npm run web              # browser, http://localhost:8081
npx expo run:android     # builds and installs a development build
npx expo run:ios         # macOS + Xcode only
npm start                # dev server for an installed development build
```
`expo run:*` are Expo CLI commands, not package scripts.

## 11. How authentication works
1. "Continue with Google" calls `useGoogleSignIn`. Web: Firebase popup (falls back to redirect if popups are blocked). Native: Google account picker, then ID token, then `signInWithCredential`.
2. `AuthContext` listens to `onAuthStateChanged`. This is the only place access is granted.
3. `evaluateAccess` runs on the **Firebase user** (email, `emailVerified`, provider `google.com`), never on a value supplied by the UI.
4. Denied: state cleared, `signOut()` called, exact error shown. Allowed: status becomes `authenticated`, the profile is synced to Firestore, and the user is redirected to the dashboard.

Domain rule (`src/utils/validateEmailDomain.ts`): exactly one `@`, a valid dotted domain, exact lower-cased match. `hbplus.fit.example.com`, `not-hbplus.fit`, `mail.hbplus.fit` and malformed input are rejected; it fails closed if no domain is configured. The Google `hd` parameter is sent only as an account-chooser hint and is not relied on.

## 12. Protected routes, Firestore, and where each control lives
`src/app/(protected)/_layout.tsx` renders children only when status is `authenticated`. While the session restores it shows a loading screen; otherwise it redirects to `/login`. Refresh, back button, reopened app and direct URL all pass through this gate.

**Firestore rules** check, on Google's servers: signed in, `email_verified`, provider `google.com`, and email matching `^[^@]+@hbplus[.]fit$`. Users can create only their own profile with `role == 'user'`, and cannot change `role`, `email` or `uid` afterwards. Everything else is denied.

```bash
npm install -g firebase-tools && firebase login
firebase use --add
firebase deploy --only firestore:rules
```

Data model `users/{uid}`: `uid, email, displayName, photoURL, role ('user' | 'admin'), createdAt, lastLoginAt`.
Admins: set the `admin: true` custom claim with the Firebase Admin SDK; the rules read it for admin reads. The client can never grant roles. No admin screen is included.

| Control | Enforced by |
|---|---|
| Domain and verified-email check before showing the app | Client (`AuthContext`) |
| Route protection, session cleanup | Client |
| Access to Firestore data, role immutability | **Firestore Security Rules (server)** |

## 13. Tests
```bash
npm test             # Jest
npm run typecheck    # tsc --noEmit
npm run lint
npm run export:web   # production web bundle in dist/
```
Covered: the domain validator (look-alike domains, malformed input), the access policy, route-guard states (loading / unauthenticated / authenticated), and `AuthProvider` (allow, deny + sign-out, error clearing, logout). Firebase is mocked. **No live Google sign-in test and no Firestore-rules emulator test are included.**

## 14. Known limitations and deployment notes
- Real Firebase/Google credentials are not included, so live sign-in on web and native, and the deployed rules, have not been tested end to end.
- A rejected account briefly exists as a Firebase Auth user before it is signed out. To block creation entirely, use Identity Platform blocking functions (`beforeSignIn`); not implemented. Any future backend endpoint or Cloud Function must verify the Firebase ID token and apply the same domain and verified-email checks.
- Native sign-in requires a development build; Expo Go is unsupported.
- The role shown on the dashboard comes from the Firestore profile; no admin features are built.
# Hbplus_Assignment
