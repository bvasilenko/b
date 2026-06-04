import { existsSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const PACKAGE_NAME = '@booga/bsuite-bindings';

export function packageRoot(): string {
  return (
    packageRootFromSelfReference() ??
    packageRootFromRuntimePath() ??
    packageRootFromDirectory(process.cwd()) ??
    failPackageRoot()
  );
}

function packageRootFromSelfReference(): string | undefined {
  const requireFromCwd = createRequire(path.join(process.cwd(), 'bsuite-bindings.js'));

  try {
    const packageEntry = requireFromCwd.resolve(PACKAGE_NAME);
    return packageRootFromDirectory(path.dirname(packageEntry));
  } catch {
    return undefined;
  }
}

function packageRootFromRuntimePath(): string | undefined {
  const runtimePath = process.argv[1];
  if (!runtimePath) {
    return undefined;
  }

  const realRuntimeDirectory = path.dirname(realpathSync(path.resolve(runtimePath)));
  return packageRootFromDirectory(realRuntimeDirectory);
}

function packageRootFromDirectory(directory: string): string | undefined {
  let current = directory;
  while (current !== path.dirname(current)) {
    if (isCurrentPackageRoot(current)) {
      return current;
    }
    current = path.dirname(current);
  }
  return undefined;
}

function isCurrentPackageRoot(directory: string): boolean {
  return hasPackageManifest(directory) && hasShippedAssets(directory);
}

function hasPackageManifest(directory: string): boolean {
  return existsSync(path.join(directory, 'package.json'));
}

function hasShippedAssets(directory: string): boolean {
  return existsSync(path.join(directory, 'skills')) && existsSync(path.join(directory, 'agents-md'));
}

function failPackageRoot(): never {
  throw new Error('Could not locate package root.');
}
