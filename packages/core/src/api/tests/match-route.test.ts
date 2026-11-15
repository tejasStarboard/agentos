import { describe, expect, test } from 'bun:test';

import { matchRoute } from '@agentos/core/api';

describe('matchRoute', () => {
  test('matches static paths', () => {
    expect(matchRoute('/health', '/health')).toEqual({});
    expect(matchRoute('/tools/search', '/tools/search')).toEqual({});
    expect(matchRoute('/tools/search', '/tools/other')).toBeNull();
  });

  test('captures :param segments', () => {
    expect(matchRoute('/contacts/:id', '/contacts/42')).toEqual({ id: '42' });
    expect(
      matchRoute('/orgs/:org/users/:user', '/orgs/acme/users/bob'),
    ).toEqual({ org: 'acme', user: 'bob' });
  });

  test('rejects length mismatch', () => {
    expect(matchRoute('/a/:id', '/a')).toBeNull();
    expect(matchRoute('/a', '/a/b')).toBeNull();
  });
});
