import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);

describe('public voice guard', () => {
  it('passes on shipped public files', async () => {
    const { stdout } = await execFileAsync('bash', ['scripts/public_voice_guard.sh']);
    expect(stdout).toContain('public voice guard passed');
  });
});
