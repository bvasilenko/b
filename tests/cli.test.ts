import { execFile } from 'node:child_process';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';
import { withTempDir } from './test-helpers.js';

const execFileAsync = promisify(execFile);

type CliTarget = 'claude' | 'codex' | 'cursor';
type CliAction = 'install' | 'uninstall';

const actionCommands: CliAction[] = ['install', 'uninstall'];

interface TargetCase {
  target: CliTarget;
  projectPreviewPath: (cwd: string) => string;
  userPreviewPath: (home: string) => string;
  userEnv?: (home: string) => NodeJS.ProcessEnv;
  explicitDestination: string;
  explicitPreviewPath: (cwd: string) => string;
}

const targetCases: TargetCase[] = [
  {
    target: 'claude',
    projectPreviewPath: (cwd) => path.join(cwd, '.claude', 'skills', 'bground', 'SKILL.md'),
    userPreviewPath: (home) => path.join(home, '.claude', 'skills', 'bground', 'SKILL.md'),
    explicitDestination: 'custom-skills',
    explicitPreviewPath: (cwd) => path.join(cwd, 'custom-skills', 'bground', 'SKILL.md'),
  },
  {
    target: 'codex',
    projectPreviewPath: (cwd) => path.join(cwd, 'AGENTS.md'),
    userPreviewPath: (home) => path.join(home, '.codex', 'AGENTS.md'),
    explicitDestination: path.join('custom', 'AGENTS.md'),
    explicitPreviewPath: (cwd) => path.join(cwd, 'custom', 'AGENTS.md'),
  },
  {
    target: 'cursor',
    projectPreviewPath: (cwd) => path.join(cwd, '.cursor', 'rules', 'bground.mdc'),
    userPreviewPath: (home) => path.join(home, '.config', 'cursor', 'rules', 'bground.mdc'),
    userEnv: (home) => ({ XDG_CONFIG_HOME: path.join(home, '.config') }),
    explicitDestination: 'custom-rules',
    explicitPreviewPath: (cwd) => path.join(cwd, 'custom-rules', 'bground.mdc'),
  },
];

const unsupportedPublicOptions = [`--p${'ills'}`, '--binary-set'];

const cli = (args: string[], options: { cwd?: string; env?: NodeJS.ProcessEnv } = {}) =>
  execFileAsync('bun', [path.resolve('src/cli.ts'), ...args], {
    cwd: options.cwd,
    env: { ...process.env, ...options.env },
  });

describe('CLI', () => {
  it('prints public-safe help for root and action commands', async () => {
    const blockedWords = new RegExp(`p${'ill'}|p${'ills'}|\u2014`, 'i');
    const helpOutputs = await Promise.all([cli(['--help']), ...actionCommands.map((action) => cli([action, '--help']))]);

    for (const { stdout } of helpOutputs) {
      expect(stdout).toContain('bsuite-bindings');
      expect(stdout).not.toMatch(blockedWords);
    }
    for (const { stdout } of helpOutputs.slice(1)) {
      expect(stdout).toContain('--target');
      expect(stdout).toContain('--tools');
      expect(stdout).toContain('--scope');
      expect(stdout).toContain('--dest');
      expect(stdout).toContain('--dry-run');
    }
  });

  it.each(targetCases)('previews $target project-scope writes without touching disk', async ({ target, projectPreviewPath }) => {
    await withTempDir(async (cwd) => {
      const previewPath = projectPreviewPath(cwd);
      const { stdout } = await cli(['install', '--target', target, '--dry-run'], { cwd });

      expect(stdout).toContain(`preview: ${target}`);
      expect(stdout).toContain(`write: ${previewPath}`);
      await expectPathMissing(previewPath);
    });
  });

  it.each(targetCases)('previews $target user-scope destination without touching disk', async ({ target, userPreviewPath, userEnv }) => {
    await withTempDir(async (home) => {
      const previewPath = userPreviewPath(home);
      const { stdout } = await cli(['install', '--target', target, '--scope', 'user', '--dry-run'], {
        env: { HOME: home, ...userEnv?.(home) },
      });

      expect(stdout).toContain(`write: ${previewPath}`);
      await expectPathMissing(previewPath);
    });
  });

  it.each(targetCases)('previews explicit $target destination without touching disk', async ({ target, explicitDestination, explicitPreviewPath }) => {
    await withTempDir(async (cwd) => {
      const previewPath = explicitPreviewPath(cwd);
      const { stdout } = await cli(['install', '--target', target, '--dest', explicitDestination, '--dry-run'], { cwd });

      expect(stdout).toContain(`write: ${previewPath}`);
      await expectPathMissing(previewPath);
    });
  });

  it('previews a single selected binary without planning unrelated writes', async () => {
    await withTempDir(async (cwd) => {
      const selectedPath = path.join(cwd, '.claude', 'skills', 'banchor', 'SKILL.md');
      const unselectedPath = path.join(cwd, '.claude', 'skills', 'bground', 'SKILL.md');
      const { stdout } = await cli(['install', '--target', 'claude', '--tools', 'banchor', '--dry-run'], { cwd });

      expect(stdout).toContain(`write: ${selectedPath}`);
      expect(stdout).not.toContain(unselectedPath);
      await expectPathMissing(selectedPath);
      await expectPathMissing(unselectedPath);
    });
  });

  it('applies a single selected binary without writing unrelated files', async () => {
    await withTempDir(async (cwd) => {
      const selectedPath = path.join(cwd, '.cursor', 'rules', 'banchor.mdc');
      const unselectedPath = path.join(cwd, '.cursor', 'rules', 'bground.mdc');
      const { stdout } = await cli(['install', '--target', 'cursor', '--tools', 'banchor'], { cwd });

      expect(stdout).toContain(`applied: cursor`);
      expect(stdout).toContain(`write: ${selectedPath}`);
      expect(stdout).not.toContain(unselectedPath);
      await expectPathPresent(selectedPath);
      await expectPathMissing(unselectedPath);
    });
  });

  it.each([
    { args: ['install', '--dry-run'], message: "required option '--target <target>' not specified" },
    { args: ['install', '--target', 'unknown', '--dry-run'], message: 'Unsupported target' },
    { args: ['install', '--target', 'claude', '--tools', 'unknown', '--dry-run'], message: 'Unsupported tool' },
    { args: ['install', '--target', 'claude', '--tools', '', '--dry-run'], message: 'Unsupported tool selector: <empty>' },
    { args: ['install', '--target', 'claude', '--tools', 'all,bground', '--dry-run'], message: 'cannot be combined' },
    { args: ['install', '--target', 'claude', '--scope', 'workspace', '--dry-run'], message: 'Unsupported scope' },
  ])('rejects invalid CLI input before planning writes: $message', async ({ args, message }) => {
    await withTempDir(async (cwd) => {
      const plannedPath = path.join(cwd, '.claude', 'skills', 'bground', 'SKILL.md');

      await expect(cli(args, { cwd })).rejects.toMatchObject({
        stderr: expect.stringContaining(message),
      });
      await expectPathMissing(plannedPath);
    });
  });

  it.each(actionCommands.flatMap((action) => unsupportedPublicOptions.map((option) => ({ action, option }))))(
    'rejects unsupported public option $option for $action before planning writes',
    async ({ action, option }) => {
      await withTempDir(async (cwd) => {
        const plannedPath = path.join(cwd, '.claude', 'skills', 'bground', 'SKILL.md');

        await expect(cli([action, '--target', 'claude', option, 'bground', '--dry-run'], { cwd })).rejects.toMatchObject({
          stderr: expect.stringContaining(`unknown option '${option}'`),
        });
        await expectPathMissing(plannedPath);
      });
    },
  );

  it.each(targetCases)('previews $target uninstall without touching disk', async ({ target, projectPreviewPath }) => {
    await withTempDir(async (cwd) => {
      const previewPath = projectPreviewPath(cwd);
      const { stdout } = await cli(['uninstall', '--target', target, '--dry-run'], { cwd });

      expect(stdout).toContain(`preview: ${target}`);
      expect(stdout).toMatch(new RegExp(`(remove|skip): ${escapeRegex(previewPath)}`));
      await expectPathMissing(previewPath);
    });
  });
});

async function expectPathPresent(filePath: string): Promise<void> {
  await expect(access(filePath)).resolves.toBeUndefined();
}

async function expectPathMissing(filePath: string): Promise<void> {
  await expect(access(filePath)).rejects.toMatchObject({ code: 'ENOENT' });
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
