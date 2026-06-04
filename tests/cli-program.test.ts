import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { executeCli, type CliContext } from '../src/cli-program.js';
import { withTempDir } from './test-helpers.js';

type ActionCommand = 'install' | 'uninstall';
type TargetName = 'claude' | 'codex' | 'cursor';

const actions: ActionCommand[] = ['install', 'uninstall'];
const targets: TargetName[] = ['claude', 'codex', 'cursor'];
const unsupportedPublicOptions = [`--p${'ills'}`, '--binary-set'];

describe('CLI program', () => {
  it.each(actions)('applies the same public-safe option contract to %s', async (action) => {
    const { stdout } = await runInMemory([action, '--help']);

    expect(stdout).toContain('--target <target>');
    expect(stdout).toContain('--tools <tools>');
    expect(stdout).toContain('--scope <scope>');
    expect(stdout).toContain('--dest <path>');
    expect(stdout).toContain('--dry-run');
    expect(stdout).not.toMatch(new RegExp(`p${'ill'}|p${'ills'}|\u2014`, 'i'));
  });

  it.each(actions.flatMap((action) => unsupportedPublicOptions.map((option) => ({ action, option }))))(
    'rejects unsupported public option $option for $action through the shared command contract',
    async ({ action, option }) => {
      await expect(runInMemory([action, '--target', 'claude', option, 'bground', '--dry-run'])).rejects.toThrow(`unknown option '${option}'`);
    },
  );

  it.each(targets)('uses the supplied CLI context for %s project paths', async (target) => {
    await withTempDir(async (cwd) => {
      const { stdout } = await runInMemory(['install', '--target', target, '--dry-run'], { cwd });

      expect(stdout).toContain(`preview: ${target}`);
      expect(stdout).toContain(projectPathFor(target, cwd));
    });
  });

  it('uses supplied environment values for user-level destination resolution', async () => {
    await withTempDir(async (home) => {
      const codexHome = path.join(home, 'custom-codex-home');
      const { stdout } = await runInMemory(['install', '--target', 'codex', '--scope', 'user', '--dry-run'], {
        env: { CODEX_HOME: codexHome, HOME: path.join(home, 'ignored-home') },
      });

      expect(stdout).toContain(path.join(codexHome, 'AGENTS.md'));
      expect(stdout).not.toContain(path.join(home, 'ignored-home'));
    });
  });
});

async function runInMemory(args: string[], overrides: Partial<Pick<CliContext, 'cwd' | 'env'>> = {}): Promise<{ stdout: string; stderr: string }> {
  const output = createBufferedStream();
  const errors = createBufferedStream();

  await executeCli({
    argv: ['node', 'bsuite-bindings', ...args],
    cwd: overrides.cwd ?? process.cwd(),
    env: { ...process.env, ...overrides.env },
    stdout: output,
    stderr: errors,
    exit: (code: number): never => {
      throw new Error(`CLI attempted to exit ${code}`);
    },
  });

  return { stdout: output.content(), stderr: errors.content() };
}

function createBufferedStream(): { write: (value: string) => void; content: () => string } {
  const chunks: string[] = [];
  return {
    write: (value: string) => {
      chunks.push(value);
    },
    content: () => chunks.join(''),
  };
}

function projectPathFor(target: TargetName, cwd: string): string {
  const paths: Record<TargetName, string> = {
    claude: path.join(cwd, '.claude', 'skills', 'bground', 'SKILL.md'),
    codex: path.join(cwd, 'AGENTS.md'),
    cursor: path.join(cwd, '.cursor', 'rules', 'bground.mdc'),
  };
  return paths[target];
}
