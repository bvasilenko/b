import { readCodexTemplate } from '../core/assets.js';
import { codexAgentsFile } from '../core/destinations.js';
import { renderCodexTemplate } from '../core/codex-template.js';
import { FilePlan } from '../core/file-plan.js';
import { hasManagedBlock, removeManagedBlock, upsertManagedBlock } from '../core/managed-block.js';
import { readExistingFile } from '../core/read-existing.js';
import type { OperationOptions, OperationResult } from '../core/types.js';

export async function installCodex(options: OperationOptions): Promise<OperationResult> {
  const plan = new FilePlan(options.dryRun);
  const filePath = codexAgentsFile(options);
  const existing = await readExistingFile(filePath);
  const nextContent = upsertManagedBlock(existing, renderCodexTemplate(await readCodexTemplate(), options.tools));
  await plan.write(filePath, nextContent, 'install Codex AGENTS.md managed block');
  return { target: 'codex', dryRun: options.dryRun, entries: plan.entries };
}

export async function uninstallCodex(options: OperationOptions): Promise<OperationResult> {
  const plan = new FilePlan(options.dryRun);
  const filePath = codexAgentsFile(options);
  const existing = await readExistingFile(filePath);
  if (!hasManagedBlock(existing)) {
    plan.skip(filePath, 'no managed Codex AGENTS.md block found');
    return { target: 'codex', dryRun: options.dryRun, entries: plan.entries };
  }
  await plan.write(filePath, removeManagedBlock(existing), 'remove Codex AGENTS.md managed block');
  return { target: 'codex', dryRun: options.dryRun, entries: plan.entries };
}
