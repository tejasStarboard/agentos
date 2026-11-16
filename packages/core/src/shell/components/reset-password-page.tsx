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
import { resetPasswordWithToken } from '../lib/auth-api';
import { navigateApp, readResetToken } from '../lib/auth-routes';
import { AuthFormCard, AuthFormPanel } from './auth-form-card';
import { AuthPublicLayout } from './auth-public-layout';

export type ResetPasswordPageProps = {
  search?: string;
};

export function ResetPasswordPage({
  search = typeof window !== 'undefined' ? window.location.search : '',
}: ResetPasswordPageProps) {
  const token = readResetToken(search);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setError('Missing reset token');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await resetPasswordWithToken(token, password);
      navigateApp('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <AuthPublicLayout>
        <AuthFormCard>
          <AuthFormPanel>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Invalid reset link</h1>
                <p className="text-balance text-muted-foreground">
                  This link is missing a token. Request a new one to continue.
                </p>
              </div>
              <Field>
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => navigateApp('/forgot-password')}
                >
                  Request a new link
                </Button>
              </Field>
              <FieldDescription className="text-center">
                <Button
                  type="button"
                  variant="link"
                  className="h-auto px-0"
                  onClick={() => navigateApp('/login')}
                >
                  Back to login
                </Button>
              </FieldDescription>
            </FieldGroup>
          </AuthFormPanel>
        </AuthFormCard>
      </AuthPublicLayout>
    );
  }

  return (
    <AuthPublicLayout>
      <AuthFormCard>
        <AuthFormPanel>
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Choose a new password</h1>
                <p className="text-balance text-muted-foreground">
                  Enter a new password for your account
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="reset-password">New password</FieldLabel>
                <Input
                  id="reset-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onValueChange={setPassword}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="reset-password-confirm">
                  Confirm password
                </FieldLabel>
                <Input
                  id="reset-password-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onValueChange={setConfirm}
                  required
                />
              </Field>
              {error ? <FieldError>{error}</FieldError> : null}
              <Field>
                <Button type="submit" disabled={busy} className="w-full">
                  {busy ? 'Saving…' : 'Update password'}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </AuthFormPanel>
      </AuthFormCard>
    </AuthPublicLayout>
  );
}
