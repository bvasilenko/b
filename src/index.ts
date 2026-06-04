import { installClaude, uninstallClaude } from './installers/claude.js';
import { installCodex, uninstallCodex } from './installers/codex.js';
import { installCursor, uninstallCursor } from './installers/cursor.js';
import type { InstallAction, OperationOptions, OperationResult } from './core/types.js';

export type { FilePlanEntry, InstallAction, InstallScope, OperationOptions, OperationResult, TargetName, ToolName } from './core/types.js';
export { SUPPORTED_TARGETS, SUPPORTED_TOOLS } from './core/types.js';
export { UsageError } from './core/errors.js';
export { installClaude, uninstallClaude, installCodex, uninstallCodex, installCursor, uninstallCursor };

export async function runBindingAction(action: InstallAction, options: OperationOptions): Promise<OperationResult> {
  if (action === 'install') {
    return installByTarget(options);
  }
  return uninstallByTarget(options);
}

function installByTarget(options: OperationOptions): Promise<OperationResult> {
  switch (options.target) {
    case 'claude':
      return installClaude(options);
    case 'codex':
      return installCodex(options);
    case 'cursor':
      return installCursor(options);
  }
}

function uninstallByTarget(options: OperationOptions): Promise<OperationResult> {
  switch (options.target) {
    case 'claude':
      return uninstallClaude(options);
    case 'codex':
      return uninstallCodex(options);
    case 'cursor':
      return uninstallCursor(options);
  }
}
