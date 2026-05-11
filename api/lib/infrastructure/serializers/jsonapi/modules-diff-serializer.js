import { formatPatch } from 'diff';

/**
 * @param {import('diff').StructuredPatch} diff
 */
export function serialize(modulesDiff) {
  return formatPatch(modulesDiff, {
    includeFileHeaders: false,
    includeIndex: false,
    includeUnderline: false,
  });
}
