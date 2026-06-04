import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { FilePlanEntry } from './types.js';

export class FilePlan {
  readonly entries: FilePlanEntry[] = [];

  constructor(private readonly dryRun: boolean) {}

  async write(filePath: string, content: string, detail: string): Promise<void> {
    this.entries.push({ action: 'write', path: filePath, detail });
    if (this.dryRun) {
      return;
    }
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, content, 'utf8');
  }

  async remove(filePath: string, detail: string): Promise<void> {
    this.entries.push({ action: 'remove', path: filePath, detail });
    if (this.dryRun) {
      return;
    }
    await rm(filePath, { force: true });
  }

  skip(filePath: string, detail: string): void {
    this.entries.push({ action: 'skip', path: filePath, detail });
  }
}
