import {
  draftModuleRepository,
  moduleRepository,
  moduleVersionRepository,
} from '../lib/infrastructure/repositories/index.js';
import { addMissingKeysToLlmMessages, bulkUpdateDraftModules, bulkUpdateModules } from '../lib/domain/usecases/index.js';
import { DomainTransaction } from '../lib/domain/DomainTransaction.js';
import { Script } from '../lib/application/scripts/script.js';
import { ScriptRunner } from '../lib/application/scripts/script-runner.js';

export class AddMissingLlmMessagesKeys extends Script {
  constructor() {
    super({
      description: 'Script pour ajouter les clés "illustrations" (à []) et "attachmentName" (à \'\') manquantes aux messages des éléments custom llm-messages',
      permanent: false,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'If true, it does not perform any update.',
          demandOption: true,
          default: true,
        },
      },
    });
  }

  async handle({ options, logger }, dependencies = {
    moduleRepository,
    moduleVersionRepository,
    draftModuleRepository,
  }) {
    logger.info({ dryRun: options.dryRun }, 'Script options');

    const modules = await dependencies.moduleRepository.list();
    const { updatedModules: modulesToUpdate, numberOfUpdatedMessages: numberOfMessagesToUpdate } = addMissingKeysToAllModules(modules);
    logger.info({ numberOfMessagesToUpdate, numberOfModulesToUpdate: modulesToUpdate.length }, 'Modules to update');

    const updatedModuleIds = modulesToUpdate.map((module) => module.id);
    const draftModules = await dependencies.draftModuleRepository.list();
    const { updatedModules: updatedDraftModules, numberOfUpdatedMessages: numberOfDraftMessagesToUpdate } = addMissingKeysToAllModules(draftModules);
    const updatedDraftModuleIds = updatedDraftModules.map((draftModule) => draftModule.id);
    const unchangedDraftModulesOfUpdatedModules = draftModules.filter((draftModule) => updatedModuleIds.includes(draftModule.moduleId) && !updatedDraftModuleIds.includes(draftModule.id));
    const draftModulesToUpdate = [...updatedDraftModules, ...unchangedDraftModulesOfUpdatedModules];
    logger.info({ numberOfMessagesToUpdate: numberOfDraftMessagesToUpdate, numberOfDraftModulesToUpdate: draftModulesToUpdate.length }, 'Draft modules to update');

    if (options.dryRun) {
      logger.info('Dry run, stopping before update');
      return;
    }

    await DomainTransaction.execute(async () => {
      await bulkUpdateModules(modulesToUpdate, dependencies);
      await bulkUpdateDraftModules({ draftModules: draftModulesToUpdate, updatedModuleIds });
    });

    logger.info({ numberOfUpdatedModules: modulesToUpdate.length, numberOfUpdatedDraftModules: draftModulesToUpdate.length }, 'Modules and draft modules updated');
  }
}

/**
 * @returns {{ updatedModules: Array, numberOfUpdatedMessages: number }} copies mises à jour des modules ayant au moins un message modifié
 */
function addMissingKeysToAllModules(modules) {
  const updatedModules = [];
  let numberOfUpdatedMessages = 0;

  for (const module of modules) {
    const result = addMissingKeysToLlmMessages(module);
    if (result.numberOfUpdatedMessages > 0) {
      updatedModules.push(result.updatedModule);
      numberOfUpdatedMessages += result.numberOfUpdatedMessages;
    }
  }

  return { updatedModules, numberOfUpdatedMessages };
}

await ScriptRunner.execute(import.meta.url, AddMissingLlmMessagesKeys);
