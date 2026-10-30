import type { ExpoConfig, ConfigContext } from 'expo/config';

const IOS_BUNDLE_ID = 'com.hbplus.access';
const ANDROID_PACKAGE = 'com.hbplus.access';

/** "123-abc.apps.googleusercontent.com" -> "com.googleusercontent.apps.123-abc" */
function reverseClientId(clientId?: string): string | undefined {
  const suffix = '.apps.googleusercontent.com';
  if (!clientId || !clientId.endsWith(suffix)) return undefined;
  return `com.googleusercontent.apps.${clientId.slice(0, -suffix.length)}`;
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const iosUrlScheme =
    reverseClientId(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID) ??
    'com.googleusercontent.apps.REPLACE_WITH_IOS_CLIENT_ID';

  return {
    ...config,
    name: 'HB+ Access',
    slug: 'hbplus-access',
    version: '1.0.0',
    scheme: 'hbplusaccess',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    ios: { supportsTablet: true, bundleIdentifier: IOS_BUNDLE_ID },
    android: {
      package: ANDROID_PACKAGE,
      adaptiveIcon: {
        backgroundColor: '#0E3B3F',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
    },
    web: { bundler: 'metro', output: 'single', favicon: './assets/favicon.png' },
    plugins: [
      'expo-router',
      ['@react-native-google-signin/google-signin', { iosUrlScheme }],
    ],
  };
};
