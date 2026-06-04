import { describe, expect, it } from 'vitest';
import { renderCodexTemplate } from '../src/core/codex-template.js';

const template = `<!-- BSUITE_BINDINGS:BEGIN -->
## b-* command-line tool bindings

Shared intro.

### bground

bground verify example

### banchor

banchor induct example
<!-- BSUITE_BINDINGS:END -->
`;

describe('renderCodexTemplate', () => {
  it.each([
    { tools: ['bground'] as const, included: 'bground verify', excluded: 'banchor induct' },
    { tools: ['banchor'] as const, included: 'banchor induct', excluded: 'bground verify' },
  ])('renders only selected tool sections', ({ tools, included, excluded }) => {
    const rendered = renderCodexTemplate(template, tools);

    expect(rendered).toContain('BSUITE_BINDINGS:BEGIN');
    expect(rendered).toContain('Shared intro.');
    expect(rendered).toContain(included);
    expect(rendered).not.toContain(excluded);
    expect(rendered).toContain('BSUITE_BINDINGS:END');
  });

  it('preserves selected tool order from normalized input', () => {
    const rendered = renderCodexTemplate(template, ['banchor', 'bground']);

    expect(rendered.indexOf('banchor induct')).toBeLessThan(rendered.indexOf('bground verify'));
  });

  it.each([
    '<!-- BSUITE_BINDINGS:BEGIN -->\nno end marker\n',
    '<!-- BSUITE_BINDINGS:BEGIN -->\nintro only\n<!-- BSUITE_BINDINGS:END -->\n',
  ])('rejects malformed templates', (malformedTemplate) => {
    expect(() => renderCodexTemplate(malformedTemplate, ['bground'])).toThrow(Error);
  });
});
