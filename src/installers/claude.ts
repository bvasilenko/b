import path from 'node:path';
import { readClaudeSkill } from '../core/assets.js';
import { claudeSkillsRoot } from '../core/destinations.js';
import { FilePlan } from '../core/file-plan.js';
import type { OperationOptions, OperationResult } from '../core/types.js';

export async function installClaude(options: OperationOptions): Promise<OperationResult> {
  const plan = new FilePlan(options.dryRun);
  const root = claudeSkillsRoot(options);
  for (const tool of options.tools) {
    await plan.write(path.join(root, tool, 'SKILL.md'), await readClaudeSkill(tool), `install ${tool} Claude Code skill`);
  }
  return { target: 'claude', dryRun: options.dryRun, entries: plan.entries };
}

export async function uninstallClaude(options: OperationOptions): Promise<OperationResult> {
  const plan = new FilePlan(options.dryRun);
  const root = claudeSkillsRoot(options);
  for (const tool of options.tools) {
    await plan.remove(path.join(root, tool, 'SKILL.md'), `remove ${tool} Claude Code skill`);
  }
  return { target: 'claude', dryRun: options.dryRun, entries: plan.entries };
}
