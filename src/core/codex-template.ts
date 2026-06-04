import type { ToolName } from './types.js';

const BEGIN_MARKER = '<!-- BSUITE_BINDINGS:BEGIN -->';
const END_MARKER = '<!-- BSUITE_BINDINGS:END -->';
const TOOL_HEADING_PREFIX = '### ';

export function renderCodexTemplate(template: string, tools: readonly ToolName[]): string {
  const body = extractBody(template);
  const { preface, sections } = splitToolSections(body);
  const selectedSections = tools.map((tool) => sectionForTool(sections, tool));
  return [BEGIN_MARKER, preface, ...selectedSections, END_MARKER].filter(Boolean).join('\n').concat('\n');
}

function extractBody(template: string): string {
  const beginIndex = template.indexOf(BEGIN_MARKER);
  const endIndex = template.indexOf(END_MARKER);
  if (beginIndex === -1 || endIndex === -1 || beginIndex >= endIndex) {
    throw new Error('Codex template is missing its managed block markers.');
  }
  return template.slice(beginIndex + BEGIN_MARKER.length, endIndex).trim();
}

function splitToolSections(body: string): { preface: string; sections: Map<ToolName, string> } {
  const lines = body.split('\n');
  const firstHeadingIndex = lines.findIndex((line) => line.startsWith(TOOL_HEADING_PREFIX));
  if (firstHeadingIndex === -1) {
    throw new Error('Codex template is missing tool sections.');
  }

  const preface = lines.slice(0, firstHeadingIndex).join('\n').trim();
  const sections = new Map<ToolName, string>();
  let currentTool: ToolName | undefined;
  let currentLines: string[] = [];

  for (const line of lines.slice(firstHeadingIndex)) {
    const headingTool = toolFromHeading(line);
    if (headingTool) {
      storeSection(sections, currentTool, currentLines);
      currentTool = headingTool;
      currentLines = [line];
      continue;
    }
    currentLines.push(line);
  }
  storeSection(sections, currentTool, currentLines);

  return { preface, sections };
}

function toolFromHeading(line: string): ToolName | undefined {
  const heading = line.slice(TOOL_HEADING_PREFIX.length).trim();
  if (heading === 'bground' || heading === 'banchor') {
    return heading;
  }
  return undefined;
}

function storeSection(sections: Map<ToolName, string>, tool: ToolName | undefined, lines: string[]): void {
  if (!tool) {
    return;
  }
  sections.set(tool, lines.join('\n').trim());
}

function sectionForTool(sections: Map<ToolName, string>, tool: ToolName): string {
  const section = sections.get(tool);
  if (!section) {
    throw new Error(`Codex template is missing the ${tool} section.`);
  }
  return section;
}
