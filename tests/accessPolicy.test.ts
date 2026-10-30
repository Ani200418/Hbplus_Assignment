import { decideProtectedRoute, evaluateAccess } from '../src/utils/accessPolicy';

const options = { allowedDomain: 'hbplus.fit', requireVerifiedEmail: true };
const good = { email: 'a@hbplus.fit', emailVerified: true, providerIds: ['google.com'] };

describe('evaluateAccess', () => {
  it('allows a verified Google account from the domain', () => {
    expect(evaluateAccess(good, options)).toEqual({ allowed: true });
  });
  it('denies another domain', () => {
    expect(evaluateAccess({ ...good, email: 'a@gmail.com' }, options)).toEqual({ allowed: false, reason: 'domain' });
  });
  it('denies a missing email', () => {
    expect(evaluateAccess({ ...good, email: null }, options)).toEqual({ allowed: false, reason: 'domain' });
  });
  it('denies an unverified email when verification is required', () => {
    expect(evaluateAccess({ ...good, emailVerified: false }, options)).toEqual({ allowed: false, reason: 'unverified' });
  });
  it('allows an unverified email only when verification is not required', () => {
    expect(evaluateAccess({ ...good, emailVerified: false }, { ...options, requireVerifiedEmail: false })).toEqual({ allowed: true });
  });
  it('denies accounts that did not come through Google', () => {
    expect(evaluateAccess({ ...good, providerIds: ['password'] }, options)).toEqual({ allowed: false, reason: 'provider' });
  });
});

describe('decideProtectedRoute', () => {
  it('waits while loading, so nothing renders prematurely', () => {
    expect(decideProtectedRoute('loading')).toBe('wait');
  });
  it('redirects unauthenticated users to login', () => {
    expect(decideProtectedRoute('unauthenticated')).toBe('login');
  });
  it('allows authenticated users', () => {
    expect(decideProtectedRoute('authenticated')).toBe('allow');
  });
});
