import { useEffect, useState, type ComponentType } from 'react';
import { config as virtualConfig } from 'virtual:agentos-config';
import { applyBranding } from '../lib/apply-branding';
import { fetchAuthSession } from '../lib/auth-api';
import {
  loginPathWithNext,
  matchPublicAuthRoute,
  navigateApp,
  type PublicAuthRoute,
} from '../lib/auth-routes';
import { ForgotPasswordPage } from './forgot-password-page';
import { LoginPage } from './login-page';
import { RegisterPage } from './register-page';
import { ResetPasswordPage } from './reset-password-page';
import { ShellRoot } from './shell-root';

export type AuthGateBranding = {
  appName: string;
  logoUrl?: string;
  faviconUrl?: string;
  fontSans?: string;
  fontHeading?: string;
};

export type AuthGateConfig = {
  auth: {
    allowSignUp: boolean;
    allowPasswordReset: boolean;
    afterSignInPath: string;
  };
  branding: AuthGateBranding;
};

export type AuthGateProps = {
  dashboard?: ComponentType;
  /** Override virtual config (tests). */
  config?: AuthGateConfig;
};

function resolveConfig(override?: AuthGateConfig): AuthGateConfig {
  if (override) return override;
  return {
    auth: {
      allowSignUp: virtualConfig.auth.allowSignUp,
      allowPasswordReset: virtualConfig.auth.allowPasswordReset,
      afterSignInPath: virtualConfig.auth.afterSignInPath,
    },
    branding: {
      appName: virtualConfig.branding.appName,
      logoUrl: virtualConfig.branding.logoUrl,
      faviconUrl: virtualConfig.branding.faviconUrl,
      fontSans: virtualConfig.branding.fontSans,
      fontHeading: virtualConfig.branding.fontHeading,
    },
  };
}

function PublicAuthRouteView({
  route,
  config,
}: {
  route: PublicAuthRoute;
  config: AuthGateConfig;
}) {
  const search = typeof window !== 'undefined' ? window.location.search : '';
  const branding = {
    appName: config.branding.appName,
    logoUrl: config.branding.logoUrl,
  };
  switch (route) {
    case 'login':
      return (
        <LoginPage
          allowSignUp={config.auth.allowSignUp}
          allowPasswordReset={config.auth.allowPasswordReset}
          afterSignInPath={config.auth.afterSignInPath}
          search={search}
          branding={branding}
        />
      );
    case 'register':
      return (
        <RegisterPage
          afterSignInPath={config.auth.afterSignInPath}
          branding={branding}
        />
      );
    case 'forgot-password':
      return <ForgotPasswordPage branding={branding} />;
    case 'reset-password':
      return <ResetPasswordPage search={search} branding={branding} />;
  }
}

/**
 * Framework auth gate: public routes outside Shell chrome; workspace requires session.
 */
export function AuthGate({ dashboard, config: configOverride }: AuthGateProps) {
  const config = resolveConfig(configOverride);
  const [pathname, setPathname] = useState(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/',
  );
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    applyBranding(config.branding);
  }, [
    config.branding.appName,
    config.branding.logoUrl,
    config.branding.faviconUrl,
    config.branding.fontSans,
    config.branding.fontHeading,
  ]);

  useEffect(() => {
    const onPop = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const publicRoute = matchPublicAuthRoute(pathname, config.auth);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (publicRoute) {
        try {
          const session = await fetchAuthSession();
          if (cancelled) return;
          if (session) {
            navigateApp(config.auth.afterSignInPath);
            return;
          }
        } catch {
          /* stay on public page */
        }
        setAuthed(false);
        setReady(true);
        return;
      }

      setReady(false);
      try {
        const session = await fetchAuthSession();
        if (cancelled) return;
        if (!session) {
          navigateApp(loginPathWithNext(pathname));
          setAuthed(false);
          setReady(true);
          return;
        }
        setAuthed(true);
        setReady(true);
      } catch {
        if (cancelled) return;
        navigateApp(loginPathWithNext(pathname));
        setAuthed(false);
        setReady(true);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [pathname, publicRoute, config.auth.afterSignInPath]);

  if (publicRoute) {
    if (!ready) {
      return (
        <div
          className="flex min-h-dvh items-center justify-center bg-background text-sm text-muted-foreground"
          data-agentos-auth-loading
        >
          Loading…
        </div>
      );
    }
    return <PublicAuthRouteView route={publicRoute} config={config} />;
  }

  if (!ready || !authed) {
    return (
      <div
        className="flex min-h-dvh items-center justify-center bg-background text-sm text-muted-foreground"
        data-agentos-auth-loading
      >
        Checking session…
      </div>
    );
  }

  return <ShellRoot dashboard={dashboard} />;
}
