import { describe, expect, it } from 'vitest';
import { UsageError } from '../src/core/errors.js';
import { parseTarget, parseTools } from '../src/core/validation.js';

const supportedTargets = ['claude', 'codex', 'cursor'] as const;

const validToolSelectors: Array<{ selector: string | undefined; tools: string[] }> = [
  { selector: undefined, tools: ['bground', 'banchor'] },
  { selector: 'all', tools: ['bground', 'banchor'] },
  { selector: 'bground', tools: ['bground'] },
  { selector: 'banchor', tools: ['banchor'] },
  { selector: ' bground, banchor, bground ', tools: ['bground', 'banchor'] },
];

const invalidToolSelectors = ['', ' , ', 'unknown', 'all,bground', 'bground,all', 'bground,unknown'];

describe('command input validation', () => {
  it.each(supportedTargets)('parses supported target %s', (target) => {
    expect(parseTarget(target)).toBe(target);
  });

  it.each(validToolSelectors)('normalizes tool selector $selector', ({ selector, tools }) => {
    expect(parseTools(selector)).toEqual(tools);
  });

  it('rejects unsupported targets with usage errors', () => {
    expect(() => parseTarget('unknown')).toThrow(UsageError);
  });

  it.each(invalidToolSelectors)('rejects unsupported tool selector %s', (selector) => {
    expect(() => parseTools(selector)).toThrow(UsageError);
  });
});
