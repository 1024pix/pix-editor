import { draftModuleRepository, draftModuleVersionRepository } from '../../infrastructure/repositories/index.js';
import { DomainTransaction } from '../DomainTransaction.js';
import { DraftModuleVersion, ModuleVersion } from '../models/index.js';
import * as updatePixApiReleaseCache from '../services/update-pix-api-release-cache.js';

export async function bulkUpdateDraftModules(draftModules, dependencies = { draftModuleRepository, draftModuleVersionRepository, updatePixApiReleaseCache }) {
  return DomainTransaction.execute(async () => {
    for (const draftModule of draftModules) {
      if (draftModule.moduleId) {
        draftModule.version = ModuleVersion.incrementMajorVersion(draftModule.version);
      }
      draftModule.version = DraftModuleVersion.incrementMinorVersion(draftModule.version);

      const savedDraftModule = await dependencies.draftModuleRepository.save(draftModule);

      await dependencies.draftModuleVersionRepository.create(new DraftModuleVersion({
        draftModuleId: savedDraftModule.id,
        version: savedDraftModule.version,
        structuredDiff: {},
      }));

      await dependencies.updatePixApiReleaseCache.onDraftModuleCreatedOrUpdated(savedDraftModule);
    }
  });
}
