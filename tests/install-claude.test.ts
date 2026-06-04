import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { installClaude, uninstallClaude } from '../src/index.js';
import { operationOptions, withTempDir } from './test-helpers.js';

describe('installClaude', () => {
  it('writes selected skill manifests and removes them on uninstall', async () => {
    await withTempDir(async (cwd) => {
      const options = operationOptions('claude', cwd);

      await installClaude(options);
      await installClaude(options);

      const bgroundPath = path.join(cwd, '.claude', 'skills', 'bground', 'SKILL.md');
      const banchorPath = path.join(cwd, '.claude', 'skills', 'banchor', 'SKILL.md');
      await expect(readFile(bgroundPath, 'utf8')).resolves.toContain('bground verify');
      await expect(readFile(banchorPath, 'utf8')).resolves.toContain('banchor induct');

      await uninstallClaude(options);
      await expect(readFile(bgroundPath, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
      await expect(readFile(banchorPath, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    });
  });

  it('writes only selected tools', async () => {
    await withTempDir(async (cwd) => {
      await installClaude(operationOptions('claude', cwd, { tools: ['bground'] }));

      await expect(readFile(path.join(cwd, '.claude', 'skills', 'bground', 'SKILL.md'), 'utf8')).resolves.toContain('bground verify');
      await expect(readFile(path.join(cwd, '.claude', 'skills', 'banchor', 'SKILL.md'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    });
  });

  it('previews writes without touching disk', async () => {
    await withTempDir(async (cwd) => {
      const result = await installClaude(operationOptions('claude', cwd, { dryRun: true }));

      expect(result.entries).toHaveLength(2);
      await expect(readFile(path.join(cwd, '.claude', 'skills', 'bground', 'SKILL.md'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    });
  });
});
