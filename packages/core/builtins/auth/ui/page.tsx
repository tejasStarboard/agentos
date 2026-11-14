import { useEffect, useState, type FormEvent } from 'react';
import { useHostApi, useHostNotifications } from '@agentos/core/client';
import { Button } from '@agentos/ui/components/button';
import { Input } from '@agentos/ui/components/input';
import { Label } from '@agentos/ui/components/label';

type SessionView = {
  user: { id: string; email: string; name: string } | null;
  roles: string[];
};

export default function AuthPage() {
  const api = useHostApi();
  const notifications = useHostNotifications();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [session, setSession] = useState<SessionView | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshSession() {
    const res = await api.fetch('/session');
    if (res.status === 401) {
      setSession({ user: null, roles: [] });
      return;
    }
    if (!res.ok) {
      setSession({ user: null, roles: [] });
      if (res.status === 502) {
        setError(
          'Auth API unreachable (502). Run: pnpm --filter @agentos/core run auth:dev',
        );
      }
      return;
    }
    const data = JSON.parse(res.body) as SessionView;
    setSession({ user: data.user, roles: data.roles ?? [] });
    setError(null);
  }

  useEffect(() => {
    void refreshSession();
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await api.fetch('/sign-in', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        let message = 'Sign-in failed';
        try {
          const body = JSON.parse(res.body) as { error?: string };
          if (body.error) message = body.error;
        } catch {
          /* ignore */
        }
        setError(message);
        await notifications.show(message, 'error');
        return;
      }
      const data = JSON.parse(res.body) as SessionView;
      setSession({ user: data.user, roles: data.roles ?? [] });
      await notifications.show('Signed in', 'success');
    } finally {
      setBusy(false);
    }
  }

  async function onSignOut() {
    setBusy(true);
    setError(null);
    try {
      await api.fetch('/sign-out', { method: 'POST' });
      setSession({ user: null, roles: [] });
      await notifications.show('Signed out', 'info');
    } finally {
      setBusy(false);
    }
  }

  if (session?.user) {
    return (
      <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
        <h1 className="text-lg font-semibold">Auth</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {session.user.email}
        </p>
        <p className="text-xs text-muted-foreground">
          Roles: {session.roles.length > 0 ? session.roles.join(', ') : 'none'}
        </p>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={onSignOut}
        >
          Sign out
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-6 h-full flex flex-col justify-center">
      <h1 className="text-lg font-semibold">Sign in</h1>
      <p className="text-sm text-muted-foreground">
        Builtin auth (Better Auth). Demo: admin@example.com / password123
      </p>
      <form className="flex flex-col gap-3" onSubmit={onSubmit}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="auth-email">Email</Label>
          <Input
            id="auth-email"
            type="email"
            autoComplete="username"
            value={email}
            onValueChange={setEmail}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="auth-password">Password</Label>
          <Input
            id="auth-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onValueChange={setPassword}
            required
          />
        </div>
        {error ? (
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </main>
  );
}
