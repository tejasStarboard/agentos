import { describe, expect, test } from 'bun:test';

import { composeInstructions } from '../api/lib/compose-instructions';

describe('composeInstructions', () => {
  test('returns default when no instructions', () => {
    expect(composeInstructions([{ id: 'crm' }])).toBe(
      'You are the AgentOS platform assistant.',
    );
  });

  test('concatenates enabled sections', () => {
    const text = composeInstructions([
      { id: 'crm', instructions: 'Be brief.' },
      { id: 'invoices', instructions: '  ' },
      { id: 'bot', instructions: 'Mention invoices.' },
    ]);
    expect(text).toContain('## crm');
    expect(text).toContain('Be brief.');
    expect(text).toContain('## bot');
    expect(text).not.toContain('## invoices');
  });
});
