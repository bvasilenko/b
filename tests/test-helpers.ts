import { dir, type DirectoryResult } from 'tmp-promise';
import type { OperationOptions, TargetName } from '../src/index.js';

export async function withTempDir(task: (directory: string) => Promise<void>): Promise<void> {
  const tmp = await dir({ unsafeCleanup: true });
  try {
    await task(tmp.path);
  } finally {
    await cleanup(tmp);
  }
}

export function operationOptions(target: TargetName, cwd: string, overrides: Partial<OperationOptions> = {}): OperationOptions {
  return {
    target,
    tools: ['bground', 'banchor'],
    scope: 'project',
    dryRun: false,
    cwd,
    env: {},
    ...overrides,
  };
}

async function cleanup(tmp: DirectoryResult): Promise<void> {
  await tmp.cleanup();
}
