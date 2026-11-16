import { describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { AccountPanel } from '../ui/account-panel';

const noopAsync = async () => {};

const signedIn = {
  user: {
    id: 'u1',
    email: 'admin@example.com',
    name: 'Admin',
  },
  roles: ['admin', 'viewer'],
};

describe('AccountPanel', () => {
  test('renders loading state when session is null', () => {
    const html = renderToStaticMarkup(
      createElement(AccountPanel, {
        session: null,
        section: 'profile',
        onSaveName: noopAsync,
        onChangePassword: noopAsync,
        onSignOut: noopAsync,
      }),
    );
    expect(html).toContain('Account');
    expect(html).toContain('Loading session');
    expect(html).not.toContain('data-slot="account-panel"');
  });

  test('renders unsigned-in state', () => {
    const html = renderToStaticMarkup(
      createElement(AccountPanel, {
        session: { user: null, roles: [] },
        section: 'profile',
        error: 'Auth API unreachable (502).',
        onSaveName: noopAsync,
        onChangePassword: noopAsync,
        onSignOut: noopAsync,
      }),
    );
    expect(html).toContain('You are not signed in');
    expect(html).toContain('/login');
    expect(html).toContain('Auth API unreachable');
    expect(html).not.toContain('data-slot="account-profile"');
  });

  test('renders only the selected profile section', () => {
    const html = renderToStaticMarkup(
      createElement(AccountPanel, {
        session: signedIn,
        section: 'profile',
        onSaveName: noopAsync,
        onChangePassword: noopAsync,
        onSignOut: noopAsync,
      }),
    );
    expect(html).toContain('data-slot="account-panel"');
    expect(html).toContain('data-account-section="profile"');
    expect(html).toContain('data-slot="account-profile"');
    expect(html).toContain('account-email');
    expect(html).toContain('admin@example.com');
    expect(html).not.toContain('data-slot="account-roles"');
    expect(html).not.toContain('data-slot="account-security"');
    expect(html).not.toContain('data-slot="account-session"');
  });

  test('renders roles section when selected', () => {
    const html = renderToStaticMarkup(
      createElement(AccountPanel, {
        session: signedIn,
        section: 'roles',
        onSaveName: noopAsync,
        onChangePassword: noopAsync,
        onSignOut: noopAsync,
      }),
    );
    expect(html).toContain('data-account-section="roles"');
    expect(html).toContain('data-slot="account-roles"');
    expect(html).toContain('admin');
    expect(html).toContain('viewer');
    expect(html).not.toContain('data-slot="account-profile"');
  });

  test('renders security and session sections when selected', () => {
    const security = renderToStaticMarkup(
      createElement(AccountPanel, {
        session: signedIn,
        section: 'security',
        onSaveName: noopAsync,
        onChangePassword: noopAsync,
        onSignOut: noopAsync,
      }),
    );
    expect(security).toContain('data-slot="account-security"');
    expect(security).toContain('account-current-password');

    const session = renderToStaticMarkup(
      createElement(AccountPanel, {
        session: signedIn,
        section: 'session',
        onSaveName: noopAsync,
        onChangePassword: noopAsync,
        onSignOut: noopAsync,
      }),
    );
    expect(session).toContain('data-slot="account-session"');
    expect(session).toContain('Sign out');
  });

  test('shows empty roles message when none assigned', () => {
    const html = renderToStaticMarkup(
      createElement(AccountPanel, {
        session: {
          user: {
            id: 'u2',
            email: 'nobody@example.com',
            name: 'Nobody',
          },
          roles: [],
        },
        section: 'roles',
        onSaveName: noopAsync,
        onChangePassword: noopAsync,
        onSignOut: noopAsync,
      }),
    );
    expect(html).toContain('No roles assigned');
  });
});
