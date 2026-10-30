import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { AuthProvider } from '../src/context/AuthContext';
import { useAuth } from '../src/hooks/useAuth';
import { ACCESS_DENIED_MESSAGE } from '../src/types/auth';

let mockListener: ((user: unknown) => void) | null = null;
const mockSignOut = jest.fn(() => Promise.resolve());

jest.mock('../src/services/firebase', () => ({ auth: {}, db: {} }));
jest.mock('../src/services/googleSession', () => ({ clearGoogleSession: jest.fn(() => Promise.resolve()) }));
jest.mock('../src/services/userProfile', () => ({ syncUserProfile: jest.fn(() => Promise.resolve('user')) }));
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth: unknown, cb: (u: unknown) => void) => {
    mockListener = cb;
    return () => {
      mockListener = null;
    };
  },
  signOut: () => mockSignOut(),
  signInWithCredential: jest.fn(),
  GoogleAuthProvider: { credential: jest.fn() },
}));

const fbUser = (overrides: Record<string, unknown> = {}) => ({
  uid: 'u1',
  email: 'employee@hbplus.fit',
  emailVerified: true,
  displayName: 'Emp Loyee',
  photoURL: null,
  providerData: [{ providerId: 'google.com' }],
  ...overrides,
});

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

beforeEach(() => {
  mockListener = null;
  mockSignOut.mockClear();
});

describe('AuthProvider', () => {
  it('stays in "loading" until Firebase reports the restored session', async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper });
    expect(result.current.status).toBe('loading');
  });

  it('treats no session as unauthenticated', async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper });
    await act(async () => mockListener?.(null));
    expect(result.current.status).toBe('unauthenticated');
    expect(result.current.user).toBeNull();
  });

  it('authenticates a verified user from the allowed domain', async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper });
    await act(async () => mockListener?.(fbUser()));
    expect(result.current.status).toBe('authenticated');
    expect(result.current.user).toEqual({ uid: 'u1', email: 'employee@hbplus.fit', displayName: 'Emp Loyee', photoURL: null });
    expect(result.current.accessError).toBeNull();
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it('signs out and denies an account from another domain', async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper });
    await act(async () => mockListener?.(fbUser({ email: 'employee@gmail.com' })));
    expect(result.current.status).toBe('unauthenticated');
    expect(result.current.user).toBeNull();
    expect(result.current.accessError).toBe(ACCESS_DENIED_MESSAGE);
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('denies look-alike domains and unverified emails', async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper });
    await act(async () => mockListener?.(fbUser({ email: 'employee@hbplus.fit.example.com' })));
    expect(result.current.status).toBe('unauthenticated');
    await act(async () => mockListener?.(fbUser({ emailVerified: false })));
    expect(result.current.status).toBe('unauthenticated');
    expect(result.current.accessError).toBe(ACCESS_DENIED_MESSAGE);
    expect(mockSignOut).toHaveBeenCalledTimes(2);
  });

  it('can clear the access error before a new attempt', async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper });
    await act(async () => mockListener?.(fbUser({ email: 'x@gmail.com' })));
    await act(async () => result.current.clearAccessError());
    expect(result.current.accessError).toBeNull();
  });

  it('logout signs out and clears state', async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper });
    await act(async () => mockListener?.(fbUser()));
    await act(async () => {
      await result.current.logout();
    });
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe('unauthenticated');
    expect(result.current.user).toBeNull();
  });
});
