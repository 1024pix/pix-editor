import { structuredPatch } from 'diff';

import { draftModuleRepository, draftModuleVersionRepository, moduleRepository } from '../../infrastructure/repositories/index.js';
import * as updatePixApiReleaseCache from '../services/update-pix-api-release-cache.js';
import { DraftModuleVersion } from '../models/index.js';
import { DomainTransaction } from '../DomainTransaction.js';

/**
 *
 * @param {import('../models/index.js').DraftModule} draftModule
 */
export async function createDraftModule(draftModule, dependencies = { draftModuleRepository, draftModuleVersionRepository, moduleRepository, updatePixApiReleaseCache, structuredPatch }) {
  return DomainTransaction.execute(async () => {
    const module = draftModule.moduleId
      ? await dependencies.moduleRepository.getById({ id: draftModule.moduleId })
      : undefined;

    draftModule.prepareForCreation(module);
    const savedDraftModule = await dependencies.draftModuleRepository.save(draftModule);

    if (module) {
      const structuredDiff = dependencies.structuredPatch('', '', module.serializeToJSON(), savedDraftModule.serializeToJSON());
      await dependencies.draftModuleVersionRepository.create(new DraftModuleVersion({
        draftModuleId: savedDraftModule.id,
        version: savedDraftModule.version,
        structuredDiff,
      }));
    }

    await dependencies.updatePixApiReleaseCache.onDraftModuleCreatedOrUpdated(savedDraftModule);

    return savedDraftModule;
  });
}
