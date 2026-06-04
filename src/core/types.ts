export const SUPPORTED_TARGETS = ['claude', 'codex', 'cursor'] as const;
export type TargetName = (typeof SUPPORTED_TARGETS)[number];

export const SUPPORTED_TOOLS = ['bground', 'banchor'] as const;
export type ToolName = (typeof SUPPORTED_TOOLS)[number];

export type InstallAction = 'install' | 'uninstall';
export type InstallScope = 'user' | 'project';

export interface OperationOptions {
  target: TargetName;
  tools: readonly ToolName[];
  scope: InstallScope;
  dryRun: boolean;
  destination?: string;
  cwd: string;
  env: NodeJS.ProcessEnv;
}

export interface FilePlanEntry {
  action: 'write' | 'remove' | 'skip';
  path: string;
  detail: string;
}

export interface OperationResult {
  target: TargetName;
  dryRun: boolean;
  entries: FilePlanEntry[];
}

export type Installer = (options: OperationOptions) => Promise<OperationResult>;
