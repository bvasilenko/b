import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { packageRoot } from './package-root.js';
import type { ToolName } from './types.js';

export async function readClaudeSkill(tool: ToolName): Promise<string> {
  return readAsset('skills', tool, 'SKILL.md');
}

export async function readCursorRule(tool: ToolName): Promise<string> {
  return readAsset('cursor-rules', `${tool}.mdc`);
}

export async function readCodexTemplate(): Promise<string> {
  return readAsset('agents-md', 'template.md');
}

async function readAsset(...segments: string[]): Promise<string> {
  return readFile(path.join(packageRoot(), ...segments), 'utf8');
}
