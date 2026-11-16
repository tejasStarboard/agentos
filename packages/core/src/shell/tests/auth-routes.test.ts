import { describe, expect, test } from 'bun:test';

import {
  isKnownAppPath,
  loginPathWithNext,
  matchPublicAuthRoute,
  normalizePathname,
  readNextParam,
  readResetToken,
} from '@agentos/core/shell/lib';

describe('auth routes', () => {
  const flags = { allowSignUp: true, allowPasswordReset: true };

  test('normalizePathname strips trailing slash', () => {
    expect(normalizePathname('/login/')).toBe('/login');
    expect(normalizePathname('/')).toBe('/');
  });

  test('matchPublicAuthRoute respects flags', () => {
    expect(matchPublicAuthRoute('/login', flags)).toBe('login');
    expect(matchPublicAuthRoute('/register', flags)).toBe('register');
    expect(
      matchPublicAuthRoute('/register', { ...flags, allowSignUp: false }),
    ).toBeNull();
    expect(
      matchPublicAuthRoute('/forgot-password', {
        ...flags,
        allowPasswordReset: false,
      }),
    ).toBeNull();
    expect(matchPublicAuthRoute('/', flags)).toBeNull();
  });

  test('isKnownAppPath only accepts workspace root', () => {
    expect(isKnownAppPath('/')).toBe(true);
    expect(isKnownAppPath('')).toBe(true);
    expect(isKnownAppPath('/totally-missing')).toBe(false);
    expect(isKnownAppPath('/__public/logo.svg')).toBe(false);
    expect(isKnownAppPath('/login')).toBe(false);
  });

  test('loginPathWithNext drops unknown next paths', () => {
    expect(loginPathWithNext('/crm')).toBe('/login');
    expect(loginPathWithNext('/totally-missing')).toBe('/login');
    expect(loginPathWithNext('/')).toBe('/login');
    expect(loginPathWithNext('/login')).toBe('/login');
  });

  test('read query helpers', () => {
    expect(readNextParam('?next=%2Fhome')).toBe('/home');
    expect(readNextParam('?next=https://evil')).toBeNull();
    expect(readResetToken('?token=abc')).toBe('abc');
  });
});
