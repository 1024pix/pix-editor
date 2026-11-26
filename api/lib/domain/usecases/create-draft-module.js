import { structuredPatch } from 'diff';

import { draftModuleRepository, draftModuleVersionRepository, moduleRepository } from '../../infrastructure/repositories/index.js';
import * as updatePixApiReleaseCache from '../services/update-pix-api-release-cache.js';
import { DraftModuleVersion } from '../models/index.js';
import { DomainTransaction } from '../DomainTransaction.js';

/**
 *
 * @param {{ draftModule: import('../models/index.js').DraftModule, userId?: number }} params
 */
export async function createDraftModule({ draftModule, userId }, dependencies = { draftModuleRepository, draftModuleVersionRepository, moduleRepository, updatePixApiReleaseCache, structuredPatch }) {
  return DomainTransaction.execute(async () => {
    const module = draftModule.moduleId
      ? await dependencies.moduleRepository.getById({ id: draftModule.moduleId })
      : undefined;

    draftModule.prepareForCreation(module);
    draftModule.modifiedBy = userId;
    const savedDraftModule = await dependencies.draftModuleRepository.save({ draftModule });

    const structuredDiff = dependencies.structuredPatch('', '', module?.serializeToJSON() ?? '', savedDraftModule.serializeToJSON());
    await dependencies.draftModuleVersionRepository.create(new DraftModuleVersion({
      draftModuleId: savedDraftModule.id,
      version: savedDraftModule.version,
      structuredDiff,
    }));

    await dependencies.updatePixApiReleaseCache.onDraftModuleCreatedOrUpdated(savedDraftModule);

    return savedDraftModule;
  });
}
