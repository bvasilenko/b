import os from 'node:os';
import path from 'node:path';
import type { OperationOptions } from './types.js';

export function claudeSkillsRoot(options: OperationOptions): string {
  if (options.destination) {
    return resolveDestination(options, options.destination);
  }
  if (options.scope === 'project') {
    return path.join(options.cwd, '.claude', 'skills');
  }
  const configuredRoot = options.env.CLAUDE_CONFIG_HOME;
  if (configuredRoot) {
    return path.join(configuredRoot, 'skills');
  }
  return path.join(homeDir(options), '.claude', 'skills');
}

export function codexAgentsFile(options: OperationOptions): string {
  if (options.destination) {
    return resolveDestination(options, options.destination);
  }
  if (options.scope === 'project') {
    return path.join(options.cwd, 'AGENTS.md');
  }
  const configuredRoot = options.env.CODEX_HOME;
  return path.join(configuredRoot ?? path.join(homeDir(options), '.codex'), 'AGENTS.md');
}

export function cursorRulesRoot(options: OperationOptions): string {
  if (options.destination) {
    return resolveDestination(options, options.destination);
  }
  if (options.scope === 'project') {
    return path.join(options.cwd, '.cursor', 'rules');
  }
  const configuredRoot = options.env.CURSOR_CONFIG_HOME;
  if (configuredRoot) {
    return path.join(configuredRoot, 'rules');
  }
  return path.join(configHome(options), 'cursor', 'rules');
}

function resolveDestination(options: OperationOptions, destination: string): string {
  return path.resolve(options.cwd, destination);
}

function configHome(options: OperationOptions): string {
  return options.env.XDG_CONFIG_HOME ?? path.join(homeDir(options), '.config');
}

function homeDir(options: OperationOptions): string {
  return options.env.HOME ?? os.homedir();
}
