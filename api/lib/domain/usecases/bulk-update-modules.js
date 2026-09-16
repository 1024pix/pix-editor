import { ModuleVersion } from '../models/index.js';
import { incrementMajorVersion } from '../models/DraftModule.js';

export async function bulkUpdateModules(modules, dependencies = { moduleRepository, moduleVersionRepository }) {
  for (const module of modules) {
    module.version = incrementMajorVersion(module.version);
    const savedModule = await dependencies.moduleRepository.save(module);

    await dependencies.moduleVersionRepository.create(ModuleVersion.fromModule(savedModule));
  }
};

