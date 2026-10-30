import { isEmailFromAllowedDomain, normalizeDomain } from '../src/utils/validateEmailDomain';

const D = 'hbplus.fit';

describe('isEmailFromAllowedDomain', () => {
  it.each([
    'employee@hbplus.fit',
    'EMPLOYEE@HBPLUS.FIT',
    '  employee@hbplus.fit  ',
    'first.last+tag@hbplus.fit',
  ])('allows %s', (email) => {
    expect(isEmailFromAllowedDomain(email, D)).toBe(true);
  });

  it.each([
    'employee@gmail.com',
    'employee@anothercompany.com',
    'employee@hbplus.fit.example.com',
    'employee@not-hbplus.fit',
    'employee@mail.hbplus.fit',
    'employee@hbplus.fitx',
    'hbplus.fit@gmail.com',
    'a@b@hbplus.fit',
    'employee@hbplus.fit@evil.com',
    '@hbplus.fit',
    'employee@',
    'employee',
    'emp loyee@hbplus.fit',
    '',
    '   ',
  ])('rejects %s', (email) => {
    expect(isEmailFromAllowedDomain(email, D)).toBe(false);
  });

  it.each([undefined, null])('rejects %s', (email) => {
    expect(isEmailFromAllowedDomain(email, D)).toBe(false);
  });

  it('rejects non-string input', () => {
    expect(isEmailFromAllowedDomain(42 as unknown as string, D)).toBe(false);
  });

  it('fails closed when no domain is configured', () => {
    expect(isEmailFromAllowedDomain('employee@hbplus.fit', '')).toBe(false);
    expect(isEmailFromAllowedDomain('employee@hbplus.fit', undefined)).toBe(false);
  });

  it('accepts a configured domain with "@" or different case', () => {
    expect(isEmailFromAllowedDomain('employee@hbplus.fit', '@HBPlus.FIT')).toBe(true);
  });
});

describe('normalizeDomain', () => {
  it('trims, lower-cases and strips "@"', () => {
    expect(normalizeDomain('  @HBplus.Fit ')).toBe('hbplus.fit');
    expect(normalizeDomain(undefined)).toBe('');
  });
});
