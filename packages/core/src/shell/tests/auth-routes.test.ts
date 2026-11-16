import { describe, expect, test } from 'bun:test';

import {
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

  test('loginPathWithNext encodes next', () => {
    expect(loginPathWithNext('/crm')).toBe('/login?next=%2Fcrm');
    expect(loginPathWithNext('/login')).toBe('/login');
  });

  test('read query helpers', () => {
    expect(readNextParam('?next=%2Fhome')).toBe('/home');
    expect(readNextParam('?next=https://evil')).toBeNull();
    expect(readResetToken('?token=abc')).toBe('abc');
  });
});
