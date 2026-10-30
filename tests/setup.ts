// Keeps the Firebase SDK from initializing real network clients in unit tests.
process.env.EXPO_PUBLIC_ALLOWED_EMAIL_DOMAIN = 'hbplus.fit';
process.env.EXPO_PUBLIC_REQUIRE_VERIFIED_EMAIL = 'true';
process.env.EXPO_PUBLIC_FIREBASE_API_KEY = 'test';
process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID = 'test';
process.env.EXPO_PUBLIC_FIREBASE_APP_ID = 'test';
process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = 'test.apps.googleusercontent.com';
