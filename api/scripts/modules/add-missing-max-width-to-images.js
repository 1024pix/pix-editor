import { addMissingMaxWidthToImages } from './transforms/add-missing-max-width-to-images.js';
import { runModulesTransform } from './helpers/run-modules-transform.js';
import { Script } from '../../lib/application/scripts/script.js';
import { ScriptRunner } from '../../lib/application/scripts/script-runner.js';

export class AddMissingMaxWidthToImagesScript extends Script {
  constructor() {
    super({
      description: 'Script pour ajouter la propriété "maxWidth" (à 0) manquante aux éléments image des modules et des brouillons',
      permanent: false,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'If true, it does not perform any update.',
          default: true,
        },
        userId: {
          type: 'number',
          describe: 'Id de l\'utilisateur "BOT Devcomp" enregistré comme auteur des modifications.',
          demandOption: true,
        },
      },
    });
  }

  async handle({ options, logger }) {
    await runModulesTransform({ transform: addMissingMaxWidthToImages, options, logger });
  }
}

await ScriptRunner.execute(import.meta.url, AddMissingMaxWidthToImagesScript);
