import { draftModuleRepository, moduleRepository } from '../../infrastructure/repositories/index.js';
import { DraftModuleInternalTitleAlreadyUsedError } from '../errors.js';
import { DraftModule } from '../models/index.js';
import { createDraftModule } from './create-draft-module.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COPY_TITLE_PREFIX = '[Copie] ';
const COPY_SLUG_SUFFIX = '-copie';

export async function duplicateModule({ moduleId }, dependencies = { moduleRepository, draftModuleRepository, createDraftModule }) {
  const module = await dependencies.moduleRepository.getById({ id: moduleId });

  const internalTitle = `${COPY_TITLE_PREFIX}${module.internalTitle}`;
  const isInternalTitleUsed = await dependencies.draftModuleRepository.isInternalTitleUsed({ internalTitle });
  if (isInternalTitleUsed) {
    throw new DraftModuleInternalTitleAlreadyUsedError(internalTitle);
  }

  const draftModule = new DraftModule({
    internalTitle,
    title: `${COPY_TITLE_PREFIX}${module.title}`,
    slug: `${module.slug}${COPY_SLUG_SUFFIX}`,
    isBeta: module.isBeta,
    visibility: module.visibility,
    details: module.details,
    sections: _recursivelyRegenerateUuids(module.sections),
    glossary: module.glossary,
  });

  return dependencies.createDraftModule(draftModule);
}

function _recursivelyRegenerateUuids(node) {
  if (Array.isArray(node)) {
    return _recursivelyRegenerateUuidsInArray(node);
  }

  const nodeIsAnObject = node !== null && typeof node === 'object';
  if (nodeIsAnObject) {
    return _recursivelyRegenerateUuidsInObject(node);
  }

  return node;
}

function _recursivelyRegenerateUuidsInArray(node) {
  return node.map(_recursivelyRegenerateUuids);
}

function _recursivelyRegenerateUuidsInObject(node) {
  return Object.fromEntries(
    Object.entries(node).map(([propertyName, propertyValue]) => {
      const isPropertyAnUuid
        = propertyName === 'id' && typeof propertyValue === 'string' && UUID_REGEX.test(propertyValue);
      const newValue = isPropertyAnUuid ? crypto.randomUUID() : _recursivelyRegenerateUuids(propertyValue);
      return [propertyName, newValue];
    }),
  );
}
