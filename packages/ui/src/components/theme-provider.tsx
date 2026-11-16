import * as React from 'react';

/** Shared theme names — add here as the product grows. */
export const AGENTOS_THEMES = ['light', 'dark'] as const;

export type AgentosTheme = (typeof AGENTOS_THEMES)[number];

type ThemeContextValue = {
  theme: string;
  setTheme: (theme: string | ((prev: string) => string)) => void;
  resolvedTheme: string;
  themes: string[];
  systemTheme?: 'light' | 'dark';
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined,
);

const FALLBACK: ThemeContextValue = {
  theme: 'dark',
  setTheme: () => {},
  resolvedTheme: 'dark',
  themes: [...AGENTOS_THEMES],
};

function readStoredTheme(storageKey: string): string | undefined {
  try {
    return localStorage.getItem(storageKey) ?? undefined;
  } catch {
    return undefined;
  }
}

function writeStoredTheme(storageKey: string, theme: string): void {
  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    /* private mode / blocked storage */
  }
}

function systemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyDocumentTheme(
  theme: string,
  attribute: string | string[],
  themeList: string[],
): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const attrs = Array.isArray(attribute) ? attribute : [attribute];

  for (const attr of attrs) {
    if (attr === 'class') {
      root.classList.remove(...themeList);
      if (theme) root.classList.add(theme);
    } else {
      if (theme) root.setAttribute(attr, theme);
      else root.removeAttribute(attr);
    }
  }

  if (theme === 'light' || theme === 'dark') {
    root.style.colorScheme = theme;
  }
}

export type ThemeProviderProps = {
  children?: React.ReactNode;
  /** DOM attribute to set — AgentOS Shell uses `"class"`. */
  attribute?: string | string[];
  defaultTheme?: string;
  enableSystem?: boolean;
  enableColorScheme?: boolean;
  storageKey?: string;
  themes?: string[];
  forcedTheme?: string;
  disableTransitionOnChange?: boolean;
  /** Accepted for API compatibility with next-themes; unused (FOUC lives in index.html). */
  nonce?: string;
  value?: Record<string, string>;
};

/**
 * Client theme provider without an inline `<script>` (React 19 warns on those).
 * Anti-FOUC is handled by the app `index.html` / iframe HTML entry scripts.
 */
export function ThemeProvider({
  children,
  attribute = 'class',
  defaultTheme = 'dark',
  enableSystem = false,
  storageKey = 'theme',
  themes: themesProp,
  forcedTheme,
}: ThemeProviderProps) {
  const themes = themesProp ?? [...AGENTOS_THEMES];

  const [theme, setThemeState] = React.useState(() => {
    if (typeof window === 'undefined') return forcedTheme ?? defaultTheme;
    return forcedTheme ?? readStoredTheme(storageKey) ?? defaultTheme;
  });

  const [systemTheme, setSystemTheme] = React.useState<'light' | 'dark'>(() =>
    typeof window === 'undefined' ? 'dark' : systemPreference(),
  );

  const resolvedTheme =
    forcedTheme ?? (theme === 'system' && enableSystem ? systemTheme : theme);

  const setTheme = React.useCallback(
    (next: string | ((prev: string) => string)) => {
      if (forcedTheme) return;
      setThemeState((prev) => {
        const value = typeof next === 'function' ? next(prev) : next;
        writeStoredTheme(storageKey, value);
        return value;
      });
    },
    [forcedTheme, storageKey],
  );

  React.useEffect(() => {
    if (!enableSystem) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemTheme(systemPreference());
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [enableSystem]);

  React.useEffect(() => {
    applyDocumentTheme(resolvedTheme, attribute, themes);
  }, [resolvedTheme, attribute, themes]);

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return;
      if (event.newValue) setThemeState(event.newValue);
      else setThemeState(defaultTheme);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [storageKey, defaultTheme]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme: forcedTheme ?? theme,
      setTheme,
      resolvedTheme,
      themes: enableSystem ? [...themes, 'system'] : themes,
      ...(enableSystem ? { systemTheme } : {}),
    }),
    [
      forcedTheme,
      theme,
      setTheme,
      resolvedTheme,
      themes,
      enableSystem,
      systemTheme,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return React.useContext(ThemeContext) ?? FALLBACK;
}
