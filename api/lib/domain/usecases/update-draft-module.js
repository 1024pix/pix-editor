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
    const updatedDraftModule = existingDraftModule.update(draftModule);

    const savedDraftModule = await dependencies.draftModuleRepository.save(updatedDraftModule);

    const structuredDiff = dependencies.structuredPatch('', '', existingDraftModule.serializeToJSON(), savedDraftModule.serializeToJSON());
    await dependencies.draftModuleVersionRepository.create(new DraftModuleVersion({
      draftModuleId: savedDraftModule.id,
      version: savedDraftModule.version,
      structuredDiff,
    }));

    await dependencies.updatePixApiReleaseCache.onDraftModuleCreatedOrUpdated(savedDraftModule);
    return savedDraftModule;
  });
}
