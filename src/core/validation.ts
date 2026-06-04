import { UsageError } from './errors.js';
import { SUPPORTED_TARGETS, SUPPORTED_TOOLS, type TargetName, type ToolName } from './types.js';

const ALL_SELECTOR = 'all';
const LIST_SEPARATOR = ',';

export function parseTarget(value: string | undefined): TargetName {
  if (isTargetName(value)) {
    return value;
  }
  throw new UsageError(`Unsupported target: ${value ?? '<missing>'}. Use one of: ${SUPPORTED_TARGETS.join(', ')}`);
}

export function parseTools(value: string | undefined): ToolName[] {
  if (value === undefined) {
    return allTools();
  }

  const selectors = splitSelectorList(value);
  if (selectors.length === 1 && selectors[0] === ALL_SELECTOR) {
    return allTools();
  }
  if (selectors.includes(ALL_SELECTOR)) {
    throw new UsageError(`Unsupported tool selector: ${ALL_SELECTOR} cannot be combined with named tools.`);
  }

  const selectedTools = new Set<ToolName>();
  for (const selector of selectors) {
    if (!isToolName(selector)) {
      throw new UsageError(`Unsupported tool: ${selector}. Use one of: ${SUPPORTED_TOOLS.join(', ')}, ${ALL_SELECTOR}`);
    }
    selectedTools.add(selector);
  }
  return [...selectedTools];
}

function splitSelectorList(value: string): string[] {
  const selectors = value
    .split(LIST_SEPARATOR)
    .map((item) => item.trim())
    .filter(Boolean);

  if (selectors.length === 0) {
    throw new UsageError(`Unsupported tool selector: <empty>. Use one of: ${SUPPORTED_TOOLS.join(', ')}, ${ALL_SELECTOR}`);
  }
  return selectors;
}

function allTools(): ToolName[] {
  return [...SUPPORTED_TOOLS];
}

function isTargetName(value: string | undefined): value is TargetName {
  return SUPPORTED_TARGETS.includes(value as TargetName);
}

function isToolName(value: string): value is ToolName {
  return SUPPORTED_TOOLS.includes(value as ToolName);
}
