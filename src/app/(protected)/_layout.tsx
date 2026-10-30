import { Redirect, Stack } from 'expo-router';
import { LoadingScreen } from '../../components/LoadingScreen';
import { useAuth } from '../../hooks/useAuth';
import { decideProtectedRoute } from '../../utils/accessPolicy';

/**
 * Guards every screen in this group. Children are only rendered once the session has been
 * restored AND the access policy passed, so refresh, back button and deep links all hit this gate.
 */
export default function ProtectedLayout() {
  const { status } = useAuth();
  const decision = decideProtectedRoute(status);
  if (decision === 'wait') return <LoadingScreen />;
  if (decision === 'login') return <Redirect href="/login" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
