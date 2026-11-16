import { useState, type SubmitEvent } from 'react';
import { Button } from '@agentos/ui/components/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@agentos/ui/components/field';
import { Input } from '@agentos/ui/components/input';
import {
  navigateApp,
  readNextParam,
  signInWithEmail,
} from '@agentos/core/shell/lib';
import { AuthFormCard, AuthFormPanel } from './auth-form-card';
import { AuthPublicLayout } from './auth-public-layout';

export type LoginPageBranding = {
  appName: string;
  logoUrl?: string;
};

export type LoginPageProps = {
  allowSignUp: boolean;
  allowPasswordReset: boolean;
  afterSignInPath: string;
  search?: string;
  branding?: LoginPageBranding;
};

export function LoginPage({
  allowSignUp,
  allowPasswordReset,
  afterSignInPath,
  search = typeof window !== 'undefined' ? window.location.search : '',
  branding = { appName: 'AgentOS' },
}: LoginPageProps) {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
      const next = readNextParam(search) ?? afterSignInPath;
      navigateApp(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthPublicLayout>
      <AuthFormCard
        appName={branding.appName}
        logoUrl={branding.logoUrl}
        footer={
          <>
            By continuing, you agree to the workspace terms for this{' '}
            {branding.appName} deployment.
          </>
        }
      >
        <AuthFormPanel>
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">
                  Login to your {branding.appName} account
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="login-email">Email</FieldLabel>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="username"
                  value={email}
                  onValueChange={setEmail}
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="login-password">Password</FieldLabel>
                  {allowPasswordReset ? (
                    <Button
                      type="button"
                      variant="link"
                      className="ml-auto h-auto px-0 text-sm"
                      onClick={() => navigateApp('/forgot-password')}
                    >
                      Forgot your password?
                    </Button>
                  ) : null}
                </div>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onValueChange={setPassword}
                  required
                />
              </Field>
              {error ? <FieldError>{error}</FieldError> : null}
              <Field>
                <Button type="submit" disabled={busy} className="w-full">
                  {busy ? 'Signing in…' : 'Login'}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Demo: admin@example.com / password123
              </FieldDescription>
              {allowSignUp ? (
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{' '}
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto px-0"
                    onClick={() => navigateApp('/register')}
                  >
                    Sign up
                  </Button>
                </FieldDescription>
              ) : null}
            </FieldGroup>
          </form>
        </AuthFormPanel>
      </AuthFormCard>
    </AuthPublicLayout>
  );
}
