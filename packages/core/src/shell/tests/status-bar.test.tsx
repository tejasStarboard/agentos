import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { StatusBar } from '@agentos/core/shell/components';
import {
  defaultEnabledById,
  STUB_EXTENSION_CATALOG,
} from '@agentos/core/shell/lib';

describe('StatusBar', () => {
  test('renders status text when provided', () => {
    const html = renderToStaticMarkup(
      <StatusBar statusText="done" statusTone="success" />,
    );
    expect(html).toContain('data-slot="status-text"');
    expect(html).toContain('data-tone="success"');
    expect(html).toContain('done');
  });

  test('shows enabled customer badge', () => {
    const html = renderToStaticMarkup(
      <StatusBar
        extensions={STUB_EXTENSION_CATALOG}
        enabledById={defaultEnabledById()}
      />,
    );
    expect(html).toContain('data-slot="status-enabled"');
    expect(html).toContain('enabled: 2/2');
  });

  test('shows crashed and loading badges from runtime props', () => {
    const html = renderToStaticMarkup(
      <StatusBar
        runtimeStatus={{
          'crm:page': 'crashed',
          'invoices:page': 'loading',
        }}
      />,
    );
    expect(html).toContain('data-slot="status-crashed"');
    expect(html).toContain('crashed: 1');
    expect(html).toContain('data-slot="status-loading"');
    expect(html).toContain('loading: 1');
  });
});
