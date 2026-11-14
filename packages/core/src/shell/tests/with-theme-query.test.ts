import { describe, expect, test } from 'bun:test';
import { withThemeQuery } from '@agentos/core/shell/lib';

describe('withThemeQuery', () => {
  test('appends theme to bare path', () => {
    expect(withThemeQuery('/__agentos/ext/crm/page.html', 'dark')).toBe(
      '/__agentos/ext/crm/page.html?theme=dark',
    );
  });

  test('replaces existing theme and keeps other params', () => {
    expect(
      withThemeQuery('/__agentos/ext/crm/page.html?foo=1&theme=light', 'dark'),
    ).toBe('/__agentos/ext/crm/page.html?foo=1&theme=dark');
  });

  test('preserves hash', () => {
    expect(withThemeQuery('/__agentos/ext/crm/page.html#slot', 'light')).toBe(
      '/__agentos/ext/crm/page.html?theme=light#slot',
    );
  });
});
