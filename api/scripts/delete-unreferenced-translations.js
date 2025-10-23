import Airtable from 'airtable';
import { Script } from '../lib/application/scripts/script.js';
import { ScriptRunner } from '../lib/application/scripts/script-runner.js';
import _ from 'lodash';
import * as config from '../lib/config.js';

const MAX_RECORDS_ALLOWED = 10;
export class DeleteUnreferencedTranslations extends Script {
  constructor() {
    super({
      description: 'Script de nettoyage des traductions présentes dans Airtable (spécial RA)',
      permanent: true, // TODO : IDK
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'If true, it does not persist any deletion made during the script.',
          demandOption: true,
          default: true,
        },
      },
    });
  }

  async handle({ options, logger }) {
    logger.info({ dryRun: options.dryRun }, 'Script DeleteUnreferencedTranslations has started');

    const airtableClient = new Airtable({
      apiKey: config.airtable.apiKey,
    }).base(config.airtable.base);
    const translations = await airtableClient.table('translations').select().all();

    const competences = await airtableClient.table('Competences').select().all();

    const areas = await airtableClient.table('Domaines').select().all();

    const challenges = await airtableClient.table('Epreuves').select().all();

    const skills = await airtableClient.table('Acquis').select().all();

    const translationKeys = translations.map(({ fields }) => fields.key);
    const baseKeys = [
      ...competences.map(({ fields }) => `competence.${fields['id persistant']}`),
      ...areas.map(({ fields }) => `area.${fields['id persistant']}`),
      ...challenges.map(({ fields }) => `challenge.${fields['id persistant']}`),
      ...skills.map(({ fields }) => `skill.${fields['id persistant']}`),
    ];

    const unreferenced = _.differenceWith(translationKeys, baseKeys, (translation, baseKey) => {
      return translation.startsWith(baseKey);
    });

    const translationsToDelete = translations
      .filter((translation) => {
        return unreferenced.includes(translation.fields.key);
      })
      .map(({ id }) => id);

    if (!options.dryRun) {
      logger.info(`About to delete ${translationsToDelete.length} translations`);

      for (const translationsToDeleteChunk of _.chunk(translationsToDelete, MAX_RECORDS_ALLOWED)) {
        await airtableClient.table('translations').destroy(translationsToDeleteChunk);
      }
    } else {
      logger.info(`${translationsToDelete.length} translations would have been deleted if dryRun disabled.`);
    }
  }
}

await ScriptRunner.execute(import.meta.url, DeleteUnreferencedTranslations);
