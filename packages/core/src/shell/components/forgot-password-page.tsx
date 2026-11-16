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
import { requestPasswordReset } from '../lib/auth-api';
import { navigateApp } from '../lib/auth-routes';
import { AuthFormCard, AuthFormPanel } from './auth-form-card';
import { AuthPublicLayout } from './auth-public-layout';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await requestPasswordReset(email);
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not request password reset',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthPublicLayout>
      <AuthFormCard>
        <AuthFormPanel>
          {done ? (
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Check your email</h1>
                <p className="text-balance text-muted-foreground">
                  If that address exists, a reset link was sent. In local dev,
                  check the auth server logs for the URL.
                </p>
              </div>
              <Field>
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => navigateApp('/login')}
                >
                  Back to login
                </Button>
              </Field>
            </FieldGroup>
          ) : (
            <form onSubmit={onSubmit}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Forgot password</h1>
                  <p className="text-balance text-muted-foreground">
                    Enter your email and we&apos;ll send a reset link
                  </p>
                </div>
                <Field>
                  <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
                  <Input
                    id="forgot-email"
                    type="email"
                    autoComplete="username"
                    placeholder="m@example.com"
                    value={email}
                    onValueChange={setEmail}
                    required
                  />
                </Field>
                {error ? <FieldError>{error}</FieldError> : null}
                <Field>
                  <Button type="submit" disabled={busy} className="w-full">
                    {busy ? 'Sending…' : 'Send reset link'}
                  </Button>
                </Field>
                <FieldDescription className="text-center">
                  Remembered it?{' '}
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto px-0"
                    onClick={() => navigateApp('/login')}
                  >
                    Login
                  </Button>
                </FieldDescription>
              </FieldGroup>
            </form>
          )}
        </AuthFormPanel>
      </AuthFormCard>
    </AuthPublicLayout>
  );
}
