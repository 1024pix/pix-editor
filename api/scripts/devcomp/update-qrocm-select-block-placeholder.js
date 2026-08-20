import { draftModuleRepository, moduleRepository } from '../../lib/infrastructure/repositories/index.js';
import { updateDraftModule, updateModule } from '../../lib/domain/usecases/index.js';
import { Script } from '../../lib/application/scripts/script.js';
import { ScriptRunner } from '../../lib/application/scripts/script-runner.js';

export class UpdateQrocmSelectBlockPlaceholder extends Script {
  constructor() {
    super({
      description: 'Script pour ajouter un placeholder par défaut dans les QROCM de type select',
      permanent: true,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'If true, it does not perform any deletion.',
          demandOption: true,
          default: true,
        },
      },
    });
  }

  async handle({ options, logger }) {
    logger.info({ dryRun: options.dryRun }, 'Script options');

    let modules = await moduleRepository.list();
    const draftModules = await draftModuleRepository.list();

    if (modules.length === 0) {
      logger.info('No modules were found');
    }

    modules = modules.filter((module) => !module.slug.includes('en'));
    let numberQROCMToBeUpdated = 0;
    const moduleById = new Map();

    for (const module of modules) {
      let moduleToBeUpdated = false;
      for (const section of module.sections) {
        for (const grain of section.grains) {
          for (const component of grain.components) {
            switch (component.type) {
              case 'element':
                if (component.element.type === 'qrocm') {
                  for (const proposal of component.element.proposals) {
                    if (proposal.type === 'select' && !proposal.placeholder) {
                      proposal.placeholder = '- Sélectionner -';
                      numberQROCMToBeUpdated++;
                      moduleToBeUpdated = true;
                    }
                  }
                }
                break;
              case 'stepper':
                for (const step of component.steps) {
                  for (const element of step.elements) {
                    if (element.type === 'qrocm') {
                      for (const proposal of element.proposals) {
                        if (proposal.type === 'select' && !proposal.placeholder) {
                          proposal.placeholder = '- Sélectionner -';
                          numberQROCMToBeUpdated++;
                          moduleToBeUpdated = true;
                        }
                      }
                    }
                  }
                }
                break;
            }
          }
        }
      }

      if (moduleToBeUpdated) {
        // Incrémenter la version du module.
        moduleById.set(module.id, module);
      }
    }

    logger.info(`${numberQROCMToBeUpdated} QROCM will be updated in ${moduleById.size} modules`);

    logger.info('Searching QROCM in draft modules');

    let numberQROCMToBeUpdatedInDraftModules = 0;
    const draftModuleById = new Map();

    for (const module of draftModules) {
      let draftModuleToBeUpdated = false;
      for (const section of module.sections) {
        for (const grain of section.grains) {
          for (const component of grain.components) {
            switch (component.type) {
              case 'element':
                if (component.element.type === 'qrocm') {
                  for (const proposal of component.element.proposals) {
                    if (proposal.type === 'select' && !proposal.placeholder) {
                      proposal.placeholder = '- Sélectionner -';
                      numberQROCMToBeUpdatedInDraftModules++;
                      draftModuleToBeUpdated = true;
                    }
                  }
                }
                break;
              case 'stepper':
                for (const step of component.steps) {
                  for (const element of step.elements) {
                    if (element.type === 'qrocm') {
                      for (const proposal of element.proposals) {
                        if (proposal.type === 'select' && !proposal.placeholder) {
                          proposal.placeholder = '- Sélectionner -';
                          numberQROCMToBeUpdatedInDraftModules++;
                          draftModuleToBeUpdated = true;
                        }
                      }
                    }
                  }
                }
                break;
            }
          }
        }
      }

      if (draftModuleToBeUpdated) {
        // Incrémenter la version du draft module.
        draftModuleById.set(module.id, module);
      }
    }

    logger.info(`${numberQROCMToBeUpdatedInDraftModules} QROCM will be updated in ${draftModuleById.size} draft modules`);

    if (options.dryRun) {
      logger.info('Dry run, stopping before update');
      return;
    }

    for (const module of moduleById.values()) {
      logger.info(`Updating module ${module.internalTitle}`);
      await updateModule(module);
    }

    for (const draftModule of draftModules.values()) {
      logger.info(`Updating draftModule ${draftModule.internalTitle}`);
      await updateDraftModule(draftModule);
    }
  }
}

await ScriptRunner.execute(import.meta.url, UpdateQrocmSelectBlockPlaceholder);
