import { DomainTransaction } from '../DomainTransaction.js';
import { ModuleVersion } from '../models/index.js';
import { incrementMajorVersion } from '../models/DraftModule.js';

export async function updateModule(module, dependencies = { moduleRepository, moduleVersionRepository }) {
  return DomainTransaction.execute(async () => {
    module.version = incrementMajorVersion(module.version);
    const module = await dependencies.moduleRepository.save(module);

    await dependencies.moduleVersionRepository.create(ModuleVersion.fromModule(module));

    return module;
  });
}
