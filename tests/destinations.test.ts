import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { claudeSkillsRoot, codexAgentsFile, cursorRulesRoot } from '../src/core/destinations.js';
import type { OperationOptions } from '../src/index.js';

const options = (overrides: Partial<OperationOptions>): OperationOptions => ({
  target: 'claude',
  tools: ['bground'],
  scope: 'project',
  dryRun: true,
  cwd: '/repo',
  env: { HOME: '/home/tester' },
  ...overrides,
});

describe('destination resolution', () => {
  it('resolves project, user, configured, and explicit Claude paths', () => {
    expect(claudeSkillsRoot(options({}))).toBe(path.join('/repo', '.claude', 'skills'));
    expect(claudeSkillsRoot(options({ scope: 'user', env: { HOME: '/home/tester', XDG_CONFIG_HOME: '/xdg' } }))).toBe(path.join('/home/tester', '.claude', 'skills'));
    expect(claudeSkillsRoot(options({ scope: 'user', env: { CLAUDE_CONFIG_HOME: '/claude' } }))).toBe(path.join('/claude', 'skills'));
    expect(claudeSkillsRoot(options({ destination: 'custom/skills' }))).toBe(path.join('/repo', 'custom', 'skills'));
  });

  it('resolves project, user, and explicit Codex paths', () => {
    expect(codexAgentsFile(options({ target: 'codex' }))).toBe(path.join('/repo', 'AGENTS.md'));
    expect(codexAgentsFile(options({ target: 'codex', scope: 'user', env: { HOME: '/home/tester' } }))).toBe(path.join('/home/tester', '.codex', 'AGENTS.md'));
    expect(codexAgentsFile(options({ target: 'codex', scope: 'user', env: { CODEX_HOME: '/codex' } }))).toBe(path.join('/codex', 'AGENTS.md'));
    expect(codexAgentsFile(options({ target: 'codex', destination: 'nested/AGENTS.md' }))).toBe(path.join('/repo', 'nested', 'AGENTS.md'));
  });

  it('resolves project, user, configured, and explicit Cursor paths', () => {
    expect(cursorRulesRoot(options({ target: 'cursor' }))).toBe(path.join('/repo', '.cursor', 'rules'));
    expect(cursorRulesRoot(options({ target: 'cursor', scope: 'user', env: { HOME: '/home/tester', XDG_CONFIG_HOME: '/xdg' } }))).toBe(path.join('/xdg', 'cursor', 'rules'));
    expect(cursorRulesRoot(options({ target: 'cursor', scope: 'user', env: { CURSOR_CONFIG_HOME: '/cursor' } }))).toBe(path.join('/cursor', 'rules'));
    expect(cursorRulesRoot(options({ target: 'cursor', destination: 'custom/rules' }))).toBe(path.join('/repo', 'custom', 'rules'));
  });
});
