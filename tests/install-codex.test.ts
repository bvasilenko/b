import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { installCodex, uninstallCodex } from '../src/index.js';
import { operationOptions, withTempDir } from './test-helpers.js';

describe('installCodex', () => {
  it('merges the managed block while preserving operator content', async () => {
    await withTempDir(async (cwd) => {
      const agentsPath = path.join(cwd, 'AGENTS.md');
      await writeFile(agentsPath, '# Operator notes\n\nKeep this line.\n', 'utf8');

      await installCodex(operationOptions('codex', cwd));
      await installCodex(operationOptions('codex', cwd));

      const content = await readFile(agentsPath, 'utf8');
      expect(content).toContain('Keep this line.');
      expect(content.match(/BSUITE_BINDINGS:BEGIN/g)).toHaveLength(1);
      expect(content).toContain('bground verify');
      expect(content).toContain('banchor induct');

      await uninstallCodex(operationOptions('codex', cwd));
      const afterUninstall = await readFile(agentsPath, 'utf8');
      expect(afterUninstall).toContain('Keep this line.');
      expect(afterUninstall).not.toContain('BSUITE_BINDINGS:BEGIN');
    });
  });

  it.each([
    { tools: ['bground'] as const, included: 'bground verify', excluded: 'banchor induct' },
    { tools: ['banchor'] as const, included: 'banchor induct', excluded: 'bground verify' },
  ])('writes only selected Codex sections for $tools', async ({ tools, included, excluded }) => {
    await withTempDir(async (cwd) => {
      const agentsPath = path.join(cwd, 'AGENTS.md');

      await installCodex(operationOptions('codex', cwd, { tools }));

      const content = await readFile(agentsPath, 'utf8');
      expect(content).toContain(included);
      expect(content).not.toContain(excluded);
    });
  });

  it('skips uninstall when no managed block exists', async () => {
    await withTempDir(async (cwd) => {
      const agentsPath = path.join(cwd, 'AGENTS.md');
      await writeFile(agentsPath, 'operator only\n', 'utf8');

      const result = await uninstallCodex(operationOptions('codex', cwd));

      expect(result.entries).toEqual([{ action: 'skip', path: agentsPath, detail: 'no managed Codex AGENTS.md block found' }]);
      await expect(readFile(agentsPath, 'utf8')).resolves.toBe('operator only\n');
    });
  });

  it('supports explicit destination files', async () => {
    await withTempDir(async (cwd) => {
      const dest = path.join(cwd, 'custom', 'AGENTS.md');

      await installCodex(operationOptions('codex', cwd, { destination: dest }));

      await expect(readFile(dest, 'utf8')).resolves.toContain('bground verify');
    });
  });
});
