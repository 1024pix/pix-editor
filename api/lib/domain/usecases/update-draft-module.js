import { structuredPatch } from 'diff';

import { draftModuleRepository, draftModuleVersionRepository } from '../../infrastructure/repositories/index.js';
import { DomainTransaction } from '../DomainTransaction.js';
import { DraftModuleVersion } from '../models/index.js';
import * as updatePixApiReleaseCache from '../services/update-pix-api-release-cache.js';

/**
 * @param {import('../models/index.js').DraftModule} draftModule
 */
export async function updateDraftModule(draftModule, dependencies = { draftModuleRepository, draftModuleVersionRepository, updatePixApiReleaseCache, structuredPatch }) {
  return DomainTransaction.execute(async () => {
    const existingDraftModule = await dependencies.draftModuleRepository.getById({ id: draftModule.id });
    existingDraftModule.update(draftModule);

    const updatedDraftModule = await dependencies.draftModuleRepository.save(existingDraftModule);

    const structuredDiff = dependencies.structuredPatch('', '', existingDraftModule.serializeToJSON(), updatedDraftModule.serializeToJSON());
    await dependencies.draftModuleVersionRepository.create(new DraftModuleVersion({
      draftModuleId: updatedDraftModule.id,
      version: updatedDraftModule.version,
      structuredDiff,
    }));

    await dependencies.updatePixApiReleaseCache.onDraftModuleCreatedOrUpdated(updatedDraftModule);
    return updatedDraftModule;
  });
}
