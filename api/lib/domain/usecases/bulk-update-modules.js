import { moduleRepository, moduleVersionRepository } from '../../infrastructure/repositories/index.js';
import { DomainTransaction } from '../DomainTransaction.js';
import { ModuleVersion } from '../models/index.js';

export async function bulkUpdateModules(modules, dependencies = { moduleRepository, moduleVersionRepository }) {
  return DomainTransaction.execute(async () => {
    const savedModules = [];

    for (const module of modules) {
      // The user who published the current version of the module is kept on the new version.
      const publishedBy = await dependencies.moduleVersionRepository.getPublishedBy({ moduleId: module.id, version: module.version });

      module.version = ModuleVersion.incrementMajorVersion(module.version);
      const savedModule = await dependencies.moduleRepository.save(module);

      await dependencies.moduleVersionRepository.create(ModuleVersion.fromModule(savedModule, { publishedBy }));
      savedModules.push(savedModule);
    }

    return savedModules;
  });
}
