import { afterEach, describe, expect, test } from 'bun:test';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runCreate } from '../lib/create';
import { main } from '../lib/run';
import { TEMPLATE_IDS } from '../lib/template-paths';

const tempRoots: string[] = [];

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'agentos-create-'));
  tempRoots.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tempRoots.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe('runCreate', () => {
  for (const template of TEMPLATE_IDS) {
    test(`scaffolds ${template} with rewritten package name`, () => {
      const root = tempDir();
      const result = runCreate({
        target: 'smoke-app',
        template,
        cwd: root,
      });

      expect(result.appName).toBe('smoke-app');
      expect(result.template).toBe(template);
      expect(existsSync(join(result.targetDir, 'src/main.tsx'))).toBe(true);
      expect(existsSync(join(result.targetDir, 'ui/dashboard.tsx'))).toBe(true);
      expect(existsSync(join(result.targetDir, 'vite.config.ts'))).toBe(true);

      const pkg = JSON.parse(
        readFileSync(join(result.targetDir, 'package.json'), 'utf8'),
      ) as { name: string };
      expect(pkg.name).toBe('smoke-app');

      const readme = readFileSync(join(result.targetDir, 'README.md'), 'utf8');
      expect(readme).toContain('smoke-app');
      expect(readme).not.toContain('__APP_NAME__');

      expect(existsSync(join(result.targetDir, 'extensions/crm-helper'))).toBe(
        false,
      );
      expect(existsSync(join(result.targetDir, 'extensions/invoice-bot'))).toBe(
        false,
      );
      expect(existsSync(join(result.targetDir, 'extensions/demo'))).toBe(false);

      if (template === 'minimal') {
        expect(existsSync(join(result.targetDir, 'extensions/.gitkeep'))).toBe(
          true,
        );
      }
      if (template === 'with-extension') {
        expect(
          existsSync(join(result.targetDir, 'extensions/starter/meta.json')),
        ).toBe(true);
        expect(
          existsSync(
            join(result.targetDir, 'extensions/starter/api/server.ts'),
          ),
        ).toBe(true);
      }
      if (template === 'with-service') {
        expect(
          existsSync(join(result.targetDir, 'services/starter/app/main.py')),
        ).toBe(true);
        const meta = JSON.parse(
          readFileSync(
            join(result.targetDir, 'extensions/starter/meta.json'),
            'utf8',
          ),
        ) as { api: { language: string } };
        expect(meta.api.language).toBe('python');
      }
    });
  }

  test('fails when target exists', () => {
    const root = tempDir();
    runCreate({ target: 'dup', template: 'minimal', cwd: root });
    expect(() =>
      runCreate({ target: 'dup', template: 'minimal', cwd: root }),
    ).toThrow(/already exists/);
  });

  test('fails on unknown template', () => {
    const root = tempDir();
    expect(() =>
      runCreate({ target: 'x', template: 'nope', cwd: root }),
    ).toThrow(/Unknown template/);
  });
});

describe('main create', () => {
  test('create without dir returns 1', async () => {
    const code = await main(['bun', 'agentos', 'create']);
    expect(code).toBe(1);
  });

  test('create via main writes app', async () => {
    const root = tempDir();
    const code = await main([
      'bun',
      'agentos',
      'create',
      'via-main',
      '--template=minimal',
      '--cwd',
      root,
    ]);
    expect(code).toBe(0);
    expect(existsSync(join(root, 'via-main/package.json'))).toBe(true);
  });
});
