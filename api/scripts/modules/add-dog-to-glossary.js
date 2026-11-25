import { addDogToGlossary } from './transforms/add-dog-to-glossary.js';
import { runModulesTransform } from './helpers/run-modules-transform.js';
import { Script } from '../../lib/application/scripts/script.js';
import { ScriptRunner } from '../../lib/application/scripts/script-runner.js';

export class AddDogToGlossaryScript extends Script {
  constructor() {
    super({
      description: '[TEST] Script pour ajouter une entrée "chien" au glossaire des modules et des brouillons',
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
    await runModulesTransform({ transform: addDogToGlossary, options, logger });
  }
}

await ScriptRunner.execute(import.meta.url, AddDogToGlossaryScript);
