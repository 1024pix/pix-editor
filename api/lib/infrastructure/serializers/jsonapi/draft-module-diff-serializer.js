import { formatPatch } from 'diff';
import Jsonapi from 'jsonapi-serializer';
import { codeToHtml } from 'shiki';

const { Serializer } = Jsonapi;

const serializer = new Serializer('draft-module-diff', { attributes: ['htmlDiff'] });

/**
 * @param {import('../../../domain/models/index.js').DraftModuleDiff} draftModuleDiff
 */
export async function serialize({ draftModuleId: id, structuredDiff }) {
  const diffText = formatPatch(structuredDiff, {
    includeFileHeaders: false,
    includeIndex: false,
    includeUnderline: false,
  });
  const htmlDiff = await codeToHtml(diffText, {
    lang: 'diff',
    theme: 'github-light',
  });
  return serializer.serialize({ id, htmlDiff });
}
