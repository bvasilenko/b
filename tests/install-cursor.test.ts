import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { installCursor, uninstallCursor } from '../src/index.js';
import { operationOptions, withTempDir } from './test-helpers.js';

describe('installCursor', () => {
  it('writes and removes cursor rule fragments', async () => {
    await withTempDir(async (cwd) => {
      await installCursor(operationOptions('cursor', cwd));

      const bgroundPath = path.join(cwd, '.cursor', 'rules', 'bground.mdc');
      const banchorPath = path.join(cwd, '.cursor', 'rules', 'banchor.mdc');
      await expect(readFile(bgroundPath, 'utf8')).resolves.toContain('bground verify');
      await expect(readFile(banchorPath, 'utf8')).resolves.toContain('banchor induct');

      await uninstallCursor(operationOptions('cursor', cwd));
      await expect(readFile(bgroundPath, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
      await expect(readFile(banchorPath, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    });
  });
});
