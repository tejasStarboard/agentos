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
import { signUpWithEmail } from '../lib/auth-api';
import { navigateApp } from '../lib/auth-routes';
import { AuthFormCard, AuthFormPanel } from './auth-form-card';
import { AuthPublicLayout } from './auth-public-layout';

export type RegisterPageProps = {
  afterSignInPath: string;
};

export function RegisterPage({ afterSignInPath }: RegisterPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signUpWithEmail({
        email,
        password,
        name: name.trim() || undefined,
      });
      navigateApp(afterSignInPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-up failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthPublicLayout>
      <AuthFormCard>
        <AuthFormPanel>
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create an account</h1>
                <p className="text-balance text-muted-foreground">
                  Register with email and password
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="register-name">Name</FieldLabel>
                <Input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  value={name}
                  onValueChange={setName}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="register-email">Email</FieldLabel>
                <Input
                  id="register-email"
                  type="email"
                  autoComplete="username"
                  placeholder="m@example.com"
                  value={email}
                  onValueChange={setEmail}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="register-password">Password</FieldLabel>
                <Input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onValueChange={setPassword}
                  required
                />
              </Field>
              {error ? <FieldError>{error}</FieldError> : null}
              <Field>
                <Button type="submit" disabled={busy} className="w-full">
                  {busy ? 'Creating…' : 'Create account'}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Already have an account?{' '}
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
        </AuthFormPanel>
      </AuthFormCard>
    </AuthPublicLayout>
  );
}
