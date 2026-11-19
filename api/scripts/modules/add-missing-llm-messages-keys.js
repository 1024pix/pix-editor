import { addMissingKeysToLlmMessages } from './transforms/add-missing-keys-to-llm-messages.js';
import { runModulesTransform } from './helpers/run-modules-transform.js';
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
    await runModulesTransform({ transform: addMissingKeysToLlmMessages, options, logger });
  }
}

await ScriptRunner.execute(import.meta.url, AddMissingLlmMessagesKeys);
