import { Redirect } from 'expo-router';
import { LoadingScreen } from '../components/LoadingScreen';
import { useAuth } from '../hooks/useAuth';
import { decideProtectedRoute } from '../utils/accessPolicy';

export default function Index() {
  const { status } = useAuth();
  const decision = decideProtectedRoute(status);
  if (decision === 'wait') return <LoadingScreen />;
  return <Redirect href={decision === 'allow' ? '/dashboard' : '/login'} />;
}
