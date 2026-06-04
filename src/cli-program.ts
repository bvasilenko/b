import { Command, CommanderError } from 'commander';
import { runBindingAction, UsageError } from './index.js';
import { parseTarget, parseTools } from './core/validation.js';
import type { InstallAction, InstallScope, OperationResult } from './core/types.js';

interface RawCommandOptions {
  target?: string;
  tools?: string;
  scope?: InstallScope;
  dryRun?: boolean;
  dest?: string;
}

export interface CliContext {
  argv: string[];
  cwd: string;
  env: NodeJS.ProcessEnv;
  stdout: WritableTextStream;
  stderr: WritableTextStream;
  exit: (code: number) => never;
}

interface WritableTextStream {
  write(value: string): unknown;
}

const COMMAND_NAME = 'bsuite-bindings';
const PACKAGE_VERSION = '0.1.0';
const DEFAULT_SCOPE: InstallScope = 'project';
const DEFAULT_TOOL_SELECTOR = 'all';

export async function executeCli(context: CliContext): Promise<void> {
  try {
    await createCliProgram(context).parseAsync(context.argv);
  } catch (error) {
    if (error instanceof CommanderError && error.exitCode === 0) {
      return;
    }
    throw error;
  }
}

export function runCli(context: CliContext): void {
  executeCli(context).catch((error: unknown) => {
    context.stderr.write(`${formatError(error)}\n`);
    context.exit(exitCodeFor(error));
  });
}

export function createCliProgram(context: CliContext): Command {
  const program = new Command();

  program
    .exitOverride()
    .configureOutput({
      writeOut: (value: string) => context.stdout.write(value),
      writeErr: (value: string) => context.stderr.write(value),
    })
    .name(COMMAND_NAME)
    .description('Install agent-substrate bindings for b-* command-line tools.')
    .version(PACKAGE_VERSION);

  addActionCommand(program, context, 'install');
  addActionCommand(program, context, 'uninstall');

  return program;
}

function addActionCommand(program: Command, context: CliContext, action: InstallAction): void {
  program
    .command(action)
    .requiredOption('--target <target>', 'Target substrate: claude, codex, or cursor.')
    .option('--tools <tools>', 'Comma-separated tools to include: bground, banchor, or all.', DEFAULT_TOOL_SELECTOR)
    .option('--scope <scope>', 'Destination scope: user or project.', parseScope, DEFAULT_SCOPE)
    .option('--dest <path>', 'Explicit destination path. For codex this is AGENTS.md. For other targets this is the target directory.')
    .option('--dry-run', 'Print planned file operations without writing.', false)
    .action(async (raw: RawCommandOptions) => {
      const result = await runBindingAction(action, {
        target: parseTarget(raw.target),
        tools: parseTools(raw.tools),
        scope: raw.scope ?? DEFAULT_SCOPE,
        dryRun: raw.dryRun ?? false,
        destination: raw.dest,
        cwd: context.cwd,
        env: context.env,
      });
      printResult(context, result);
    });
}

function parseScope(value: string): InstallScope {
  if (value === 'user' || value === 'project') {
    return value;
  }
  throw new UsageError(`Unsupported scope: ${value}. Use user or project.`);
}

function printResult(context: CliContext, result: OperationResult): void {
  writeLine(context, `${result.dryRun ? 'preview' : 'applied'}: ${result.target}`);
  for (const entry of result.entries) {
    writeLine(context, `${entry.action}: ${entry.path} (${entry.detail})`);
  }
}

function writeLine(context: CliContext, value: string): void {
  context.stdout.write(`${value}\n`);
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function exitCodeFor(error: unknown): number {
  return error instanceof UsageError ? error.exitCode : 1;
}
