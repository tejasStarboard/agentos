import { useEffect, useState } from 'react';
import { useHostApi, useHostNotifications } from '@agentos/core/client';
import { Button } from '@agentos/ui/components/button';

type SessionView = {
  user: { id: string; email: string; name: string } | null;
  roles: string[];
};

/**
 * Auth secondary Activity Bar page — account settings (not public sign-in).
 * Public auth lives at `/login`, `/register`, `/reset-password` (Shell gate).
 */
export default function AuthAccountPage() {
  const api = useHostApi();
  const notifications = useHostNotifications();
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

  async function onSignOut() {
    setBusy(true);
    setError(null);
    try {
      await api.fetch('/sign-out', { method: 'POST' });
      setSession({ user: null, roles: [] });
      await notifications.show('Signed out', 'info');
      // Leave the iframe account panel; top-level gate will redirect on next load.
      window.top!.location.assign('/login');
    } finally {
      setBusy(false);
    }
  }

  if (!session) {
    return (
      <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
        <h1 className="text-lg font-semibold">Account</h1>
        <p className="text-sm text-muted-foreground">Loading session…</p>
      </main>
    );
  }

  if (!session.user) {
    return (
      <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
        <h1 className="text-lg font-semibold">Account</h1>
        <p className="text-sm text-muted-foreground">
          You are not signed in. Open{' '}
          <span className="font-medium text-foreground">/login</span> to
          authenticate.
        </p>
        {error ? (
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
      <h1 className="text-lg font-semibold">Account</h1>
      <p className="text-sm text-muted-foreground">
        Signed in as {session.user.email}
      </p>
      <p className="text-xs text-muted-foreground">
        Name: {session.user.name || '—'}
      </p>
      <p className="text-xs text-muted-foreground">
        Roles: {session.roles.length > 0 ? session.roles.join(', ') : 'none'}
      </p>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
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
