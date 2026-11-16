import { describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { LoginPage } from '@agentos/core/shell/components';

describe('LoginPage', () => {
  test('renders sign-in form and optional links', () => {
    const html = renderToStaticMarkup(
      createElement(LoginPage, {
        allowSignUp: true,
        allowPasswordReset: true,
        afterSignInPath: '/',
        search: '',
      }),
    );
    expect(html).toContain('Welcome back');
    expect(html).toContain('login-email');
    expect(html).toContain('Forgot your password?');
    expect(html).toContain('Sign up');
    expect(html).toContain('data-slot="card"');
  });

  test('hides register/forgot when disabled', () => {
    const html = renderToStaticMarkup(
      createElement(LoginPage, {
        allowSignUp: false,
        allowPasswordReset: false,
        afterSignInPath: '/',
        search: '',
      }),
    );
    expect(html).not.toContain('Forgot your password?');
    expect(html).not.toContain('Sign up');
  });
});
