import { describe, expect, test } from 'bun:test';

import { parseArgs, usage } from '../lib/parse-args';

describe('parseArgs', () => {
  test('parses dev command', () => {
    const parsed = parseArgs(['bun', 'agentos', 'dev']);
    expect(parsed.command).toBe('dev');
    expect(parsed.cwd).toBeUndefined();
    expect(parsed.unknown).toEqual([]);
  });

  test('parses build with --cwd', () => {
    const parsed = parseArgs(['bun', 'agentos', 'build', '--cwd', '/tmp/app']);
    expect(parsed.command).toBe('build');
    expect(parsed.cwd).toBe('/tmp/app');
  });

  test('parses --cwd=value form', () => {
    const parsed = parseArgs(['bun', 'agentos', 'dev', '--cwd=/tmp/app']);
    expect(parsed.command).toBe('dev');
    expect(parsed.cwd).toBe('/tmp/app');
  });

  test('help flag without command yields help', () => {
    const parsed = parseArgs(['bun', 'agentos', '--help']);
    expect(parsed.command).toBe('help');
    expect(parsed.helpRequested).toBe(true);
  });

  test('collects unknown args', () => {
    const parsed = parseArgs(['bun', 'agentos', 'dev', '--foo']);
    expect(parsed.command).toBe('dev');
    expect(parsed.unknown).toEqual(['--foo']);
  });

  test('usage mentions dev and build', () => {
    expect(usage()).toContain('dev');
    expect(usage()).toContain('build');
  });
});
