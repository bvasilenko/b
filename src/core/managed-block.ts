const BEGIN = '<!-- BSUITE_BINDINGS:BEGIN -->';
const END = '<!-- BSUITE_BINDINGS:END -->';
const BLOCK_PATTERN = new RegExp(`${escapeRegex(BEGIN)}[\\s\\S]*?${escapeRegex(END)}\\n?`, 'g');

export function upsertManagedBlock(existingContent: string, managedBlock: string): string {
  const normalizedBlock = ensureTrailingNewline(managedBlock);
  if (BLOCK_PATTERN.test(existingContent)) {
    return existingContent.replace(BLOCK_PATTERN, normalizedBlock);
  }
  const prefix = existingContent.length === 0 ? '' : ensureTrailingNewline(existingContent);
  return `${prefix}${normalizedBlock}`;
}

export function removeManagedBlock(existingContent: string): string {
  return existingContent.replace(BLOCK_PATTERN, '').replace(/\n{3,}/g, '\n\n');
}

export function hasManagedBlock(content: string): boolean {
  return new RegExp(`${escapeRegex(BEGIN)}[\\s\\S]*?${escapeRegex(END)}`).test(content);
}

function ensureTrailingNewline(content: string): string {
  return content.endsWith('\n') ? content : `${content}\n`;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
