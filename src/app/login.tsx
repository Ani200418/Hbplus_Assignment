import { Redirect } from 'expo-router';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { BrandMark } from '../components/BrandMark';
import { ErrorMessage } from '../components/ErrorMessage';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { LoadingScreen } from '../components/LoadingScreen';
import { env } from '../config/environment';
import { useAuth } from '../hooks/useAuth';
import { useGoogleSignIn } from '../hooks/useGoogleSignIn';
import { colors, radius } from '../theme';

export default function LoginScreen() {
  const { status, accessError, missingConfig } = useAuth();
  const { signIn, pending, error } = useGoogleSignIn();
  const { width } = useWindowDimensions();
  const wide = width >= 860;

  if (status === 'loading') return <LoadingScreen />;
  if (status === 'authenticated') return <Redirect href="/dashboard" />;

  const configured = missingConfig.length === 0;
  const message = accessError ?? error;

  return (
    <ScrollView style={styles.page} contentContainerStyle={[styles.pageContent, wide && styles.pageWide]} keyboardShouldPersistTaps="handled">
      <View style={[styles.hero, wide && styles.heroWide]}>
        <BrandMark size={52} inverted />
        <Text style={styles.heroTitle}>HB+ Access</Text>
        <Text style={styles.heroText}>Internal tools for the HB+ team. Sign in with your work account to continue.</Text>
      </View>

      <View style={[styles.panel, wide && styles.panelWide]}>
        <View style={styles.card}>
          <Text style={styles.title} accessibilityRole="header">Sign in</Text>
          <Text style={styles.body}>
            Access is limited to authorized members of the organization. Use your{' '}
            <Text style={styles.domain}>@{env.allowedEmailDomain || 'organization'}</Text> Google account.
          </Text>

          {message ? <ErrorMessage message={message} /> : null}

          {!configured ? (
            <ErrorMessage message={`Setup incomplete. Add these to your .env file: ${missingConfig.join(', ')}.`} />
          ) : null}

          <GoogleSignInButton
            onPress={signIn}
            loading={pending}
            disabled={!configured}
            label={accessError ? 'Try a different Google account' : 'Continue with Google'}
          />

          <Text style={styles.fine}>Personal Gmail accounts and other organizations cannot sign in.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.chalk },
  pageContent: { flexGrow: 1 },
  pageWide: { flexDirection: 'row' },
  hero: { backgroundColor: colors.teal, paddingHorizontal: 28, paddingTop: 56, paddingBottom: 40, gap: 14 },
  heroWide: { flex: 5, justifyContent: 'center', paddingHorizontal: 64 },
  heroTitle: { color: colors.paper, fontSize: 38, fontWeight: '800', letterSpacing: -1 },
  heroText: { color: '#CFE3E5', fontSize: 17, lineHeight: 25, maxWidth: 420 },
  panel: { padding: 20, justifyContent: 'center', alignItems: 'center' },
  panelWide: { flex: 6, padding: 48 },
  card: { width: '100%', maxWidth: 440, backgroundColor: colors.paper, borderRadius: radius.lg, padding: 28, gap: 18, borderWidth: 1, borderColor: colors.line },
  title: { color: colors.ink, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  body: { color: colors.inkSoft, fontSize: 16, lineHeight: 24 },
  domain: { color: colors.teal, fontWeight: '700' },
  fine: { color: colors.inkSoft, fontSize: 13, lineHeight: 19, textAlign: 'center' },
});
