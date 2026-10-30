import { render, screen } from '@testing-library/react-native';
import ProtectedLayout from '../src/app/(protected)/_layout';

let mockStatus: 'loading' | 'authenticated' | 'unauthenticated' = 'loading';

jest.mock('../src/hooks/useAuth', () => ({ useAuth: () => ({ status: mockStatus }) }));
jest.mock('expo-router', () => {
  const { Text: T } = require('react-native');
  return {
    Redirect: ({ href }: { href: string }) => <T testID="redirect">{href}</T>,
    Stack: () => <T testID="protected-content">dashboard</T>,
  };
});

describe('protected route group', () => {
  it('renders nothing sensitive while auth resolves', async () => {
    mockStatus = 'loading';
    await render(<ProtectedLayout />);
    expect(screen.queryByTestId('protected-content')).toBeNull();
    expect(screen.queryByTestId('redirect')).toBeNull();
  });

  it('redirects unauthenticated users to /login', async () => {
    mockStatus = 'unauthenticated';
    await render(<ProtectedLayout />);
    expect(screen.queryByTestId('protected-content')).toBeNull();
    expect(screen.getByTestId('redirect').props.children).toBe('/login');
  });

  it('renders content for authenticated users', async () => {
    mockStatus = 'authenticated';
    await render(<ProtectedLayout />);
    expect(screen.getByTestId('protected-content')).toBeTruthy();
    expect(screen.queryByTestId('redirect')).toBeNull();
  });
});

