import { formatPatch } from 'diff';
import { codeToHtml } from 'shiki';

/**
 * @param {import('diff').StructuredPatch} diff
 */
export async function serialize(modulesDiff) {
  const diffText = formatPatch(modulesDiff, {
    includeFileHeaders: false,
    includeIndex: false,
    includeUnderline: false,
  });
  return codeToHtml(diffText, {
    lang: 'diff',
    theme: 'github-light',
  });
}
