import { draftModuleRepository, moduleRepository } from '../../lib/infrastructure/repositories/index.js';
import { bulkUpdateDraftModules, bulkUpdateModules } from '../../lib/domain/usecases/index.js';
import { addMissingKeysToLlmMessages } from './transforms/add-missing-keys-to-llm-messages.js';
import { DomainTransaction } from '../../lib/domain/DomainTransaction.js';
import { DraftModule, Module } from '../../lib/domain/models/index.js';
import { Script } from '../../lib/application/scripts/script.js';
import { ScriptRunner } from '../../lib/application/scripts/script-runner.js';

export class AddMissingLlmMessagesKeys extends Script {
  constructor() {
    super({
      description: 'Script pour ajouter les clés "illustrations" (à []) et "attachmentName" (à \'\') manquantes aux messages des éléments custom llm-messages',
      permanent: false,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'If true, it does not perform any update.',
          default: true,
        },
      },
    });
  }

  async handle({ options, logger }) {
    logger.info({ dryRun: options.dryRun }, 'Script options');

    const modulesToUpdate = getModulesToUpdate(await moduleRepository.list());
    logModulesToUpdate(modulesToUpdate, logger);

    const modulesToUpdateIds = modulesToUpdate.map(({ module }) => module.id);
    const draftModulesToUpdate = getDraftModulesToUpdate(await draftModuleRepository.list(), modulesToUpdateIds);
    logDraftModulesToUpdate(draftModulesToUpdate, logger);

    if (modulesToUpdate.length === 0 && draftModulesToUpdate.length === 0) {
      logger.info('Nothing to update');
      return;
    }

    if (options.dryRun) {
      logger.info('Dry run: nothing saved. Re-run with --dryRun=false to apply changes.');
      return;
    }

    const { savedModules, savedDraftModules } = await DomainTransaction.execute(async () => {
      const savedModules = await bulkUpdateModules(modulesToUpdate.map(({ module }) => module));
      const savedDraftModules = await bulkUpdateDraftModules({
        draftModules: draftModulesToUpdate.map(({ draftModule }) => draftModule),
        updatedModuleIds: modulesToUpdateIds,
      });
      return { savedModules, savedDraftModules };
    });
    logSavedModules({ savedModules, savedDraftModules }, logger);
  }
}

function getModulesToUpdate(modules) {
  return modules
    .map((module) => {
      const { sections, numberOfTransformedMessages } = addMissingKeysToLlmMessages(module);
      return { module: new Module({ ...module, sections }), numberOfTransformedMessages };
    })
    .filter(({ numberOfTransformedMessages }) => numberOfTransformedMessages > 0);
}

function getDraftModulesToUpdate(draftModules, updatedModuleIds) {
  return draftModules
    .map((draftModule) => {
      const { sections, numberOfTransformedMessages } = addMissingKeysToLlmMessages(draftModule);
      const isDraftOfUpdatedModule = updatedModuleIds.includes(draftModule.moduleId);
      return {
        draftModule: new DraftModule({ ...draftModule, sections }),
        numberOfTransformedMessages,
        isDraftOfUpdatedModule,
      };
    })
    .filter(({
      numberOfTransformedMessages,
      isDraftOfUpdatedModule,
    }) => numberOfTransformedMessages > 0 || isDraftOfUpdatedModule);
}

function logModulesToUpdate(modulesToUpdate, logger) {
  for (const { module, numberOfTransformedMessages } of modulesToUpdate) {
    logger.info({ ...toLogSummary(module), numberOfTransformedMessages }, 'Module to update');
  }
  logger.info(`${modulesToUpdate.length} module(s) to update, ${countTransformedMessages(modulesToUpdate)} message(s) to complete`);
}

function logDraftModulesToUpdate(draftModulesToUpdate, logger) {
  for (const { draftModule, numberOfTransformedMessages, isDraftOfUpdatedModule } of draftModulesToUpdate) {
    logger.info({
      ...toLogSummary(draftModule),
      numberOfTransformedMessages,
      willBeRecreated: isDraftOfUpdatedModule,
    }, 'Draft module to update');
  }
  const numberOfDraftModulesToRecreate = draftModulesToUpdate.filter(({ isDraftOfUpdatedModule }) => isDraftOfUpdatedModule).length;
  logger.info(`${draftModulesToUpdate.length} draft module(s) to update (${numberOfDraftModulesToRecreate} recreated because their module is updated), ${countTransformedMessages(draftModulesToUpdate)} message(s) to complete`);
}

function logSavedModules({ savedModules, savedDraftModules }, logger) {
  for (const module of savedModules) {
    logger.info(toLogSummary(module), 'Module updated');
  }
  for (const draftModule of savedDraftModules) {
    logger.info(toLogSummary(draftModule), 'Draft module updated');
  }
  logger.info(`${savedModules.length} module(s) and ${savedDraftModules.length} draft module(s) updated`);
}

function countTransformedMessages(modulesToUpdate) {
  return modulesToUpdate.reduce((total, { numberOfTransformedMessages }) => total + numberOfTransformedMessages, 0);
}

function toLogSummary({ id, internalTitle, version }) {
  return { id, internalTitle, version };
}

await ScriptRunner.execute(import.meta.url, AddMissingLlmMessagesKeys);
