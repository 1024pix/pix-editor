import { structuredPatch } from 'diff';

import { draftModuleRepository, moduleRepository } from '../../infrastructure/repositories/index.js';
import { DraftModuleDiffError } from '../errors.js';
import { DraftModuleDiff } from '../models/index.js';

export async function getDraftModuleDiff({ draftModuleId }, dependencies = { draftModuleRepository, moduleRepository, structuredPatch }) {
  const draftModule = await dependencies.draftModuleRepository.getById({ id: draftModuleId });
  if (!draftModule.moduleId) throw new DraftModuleDiffError('cannot generate diff for creation draft');

  const module = await dependencies.moduleRepository.getById({ id: draftModule.moduleId });

  const structuredDiff = dependencies.structuredPatch('', '', module.serializeToJSON(), draftModule.serializeToJSON());

  return new DraftModuleDiff({
    draftModuleId,
    structuredDiff,
  });
}
