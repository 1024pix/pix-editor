import { incrementMinorVersion, DraftModuleVersion, ModuleVersion } from '../models/index.js';
import * as updatePixApiReleaseCache from '../services/update-pix-api-release-cache.js';

export async function bulkUpdateDraftModules(draftModules, dependencies = { draftModuleRepository, draftModuleVersionRepository, moduleRepository, updatePixApiReleaseCache }) {
  for (const draftModule of draftModules) {
    const savedDraftModule = await dependencies.draftModuleRepository.save(draftModule);
    const module = await dependencies.moduleRepository.getById({ id: draftModule.moduleId });

    if (module) {
      savedDraftModule.version = ModuleVersion.incrementMajorVersion(savedDraftModule.version);
    }
    savedDraftModule.version = incrementMinorVersion(savedDraftModule.version);

    await dependencies.draftModuleVersionRepository.create(new DraftModuleVersion({
      draftModuleId: savedDraftModule.id,
      version: savedDraftModule.version,
      structuredDiff: {},
    }));

    await dependencies.updatePixApiReleaseCache.onDraftModuleCreatedOrUpdated(savedDraftModule);
  }
}

