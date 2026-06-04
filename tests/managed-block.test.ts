import { describe, expect, it } from 'vitest';
import { hasManagedBlock, removeManagedBlock, upsertManagedBlock } from '../src/core/managed-block.js';

const block = '<!-- BSUITE_BINDINGS:BEGIN -->\nmanaged\n<!-- BSUITE_BINDINGS:END -->\n';

describe('managed AGENTS.md block', () => {
  it('appends managed content to empty and existing operator content', () => {
    expect(upsertManagedBlock('', block)).toBe(block);
    expect(upsertManagedBlock('operator\n', block)).toBe(`operator\n${block}`);
  });

  it('replaces exactly one existing managed block while preserving surrounding content', () => {
    const existing = `before\n<!-- BSUITE_BINDINGS:BEGIN -->\nold\n<!-- BSUITE_BINDINGS:END -->\nafter\n`;

    expect(upsertManagedBlock(existing, block)).toBe(`before\n${block}after\n`);
  });

  it('removes managed content without deleting operator content', () => {
    const existing = `before\n${block}\nafter\n`;

    const removed = removeManagedBlock(existing);
    expect(removed).toContain('before');
    expect(removed).toContain('after');
    expect(removed).not.toContain('managed');
    expect(removed).not.toContain('BSUITE_BINDINGS');
    expect(hasManagedBlock(existing)).toBe(true);
    expect(hasManagedBlock('before\nafter\n')).toBe(false);
  });
});
