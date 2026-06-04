import path from 'node:path';
import { readCursorRule } from '../core/assets.js';
import { cursorRulesRoot } from '../core/destinations.js';
import { FilePlan } from '../core/file-plan.js';
import type { OperationOptions, OperationResult } from '../core/types.js';

export async function installCursor(options: OperationOptions): Promise<OperationResult> {
  const plan = new FilePlan(options.dryRun);
  const root = cursorRulesRoot(options);
  for (const tool of options.tools) {
    await plan.write(path.join(root, `${tool}.mdc`), await readCursorRule(tool), `install ${tool} Cursor rule`);
  }
  return { target: 'cursor', dryRun: options.dryRun, entries: plan.entries };
}

export async function uninstallCursor(options: OperationOptions): Promise<OperationResult> {
  const plan = new FilePlan(options.dryRun);
  const root = cursorRulesRoot(options);
  for (const tool of options.tools) {
    await plan.remove(path.join(root, `${tool}.mdc`), `remove ${tool} Cursor rule`);
  }
  return { target: 'cursor', dryRun: options.dryRun, entries: plan.entries };
}
