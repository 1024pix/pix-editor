import { Script } from '../lib/application/scripts/script.js';
import { ScriptRunner } from '../lib/application/scripts/script-runner.js';
import Joi from 'joi';
import { csvFileParser } from '../lib/application/scripts/parsers.js';
import { knex } from '../db/knex-database-connection.js';
import { translationRepository } from '../lib/infrastructure/repositories/index.js';

export const csvSchemas = [
  { name: 'Thèmes/acquis', schema: Joi.string().required() },
  { name: 'Titre pratique', schema: Joi.string().required() },
  { name: 'description', schema: Joi.string().required() },
];

class TubeTranslationsDTO {
  constructor(row) {
    this.tubeName = row['Thèmes/acquis'];
    this.practicalTitle = row['Titre pratique'];
    this.practicalDescription = row['description'];
  }
}

export function getTubeIdsFromPixFramework(knexConn = knex) {
  return knexConn
    .select('tubes.id', 'tubes.name')
    .from('tubes')
    .join('thematics', 'thematics.id', 'tubes.thematicId')
    .join('competences', 'competences.id', 'thematics.competenceId')
    .join('areas', 'areas.id', 'competences.areaId')
    .join('frameworks', 'frameworks.id', 'areas.frameworkId')
    .where('frameworks.name', 'Pix');
}

export class UpdateTubesTranslationScript extends Script {
  constructor() {
    super({
      description: 'Script de mise à jour des traductions des sujets',
      permanent: true,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'If true, it does not perform any update.',
          demandOption: true,
          default: true,
        },
        file: {
          type: 'string',
          describe: 'Chemin du fichier CSV à lire',
          demandOption: true,
          coerce: csvFileParser(csvSchemas),
        },
      },
    });
  }

  async handle({ options, logger }) {
    logger.info({ dryRun: options.dryRun, ids: options.id }, 'Script options');
    const tubesFromPix = await getTubeIdsFromPixFramework();

    await knex.transaction(async (trx) => {
      try {
        let updatedTubesCount = 0;
        for (const row of options.file) {
          const { tubeName, practicalTitle, practicalDescription } = new TubeTranslationsDTO(row);
          const tubeIds = tubesFromPix.filter(({ name }) => name === tubeName);

          if (tubeIds.length !== 1) {
            logger.error(`Found ${tubeIds.length} tube(s) with name ${tubeName}`, { tubeIds: tubeIds.map(({ id }) => id) });
            continue;
          }

          const tubeId = tubeIds[0].id;
          const translations = [{ key: `tube.${tubeId}.practicalTitle`, locale: 'fr', value: practicalTitle }, { key: `tube.${tubeId}.practicalDescription`, locale: 'fr', value: practicalDescription }];
          await translationRepository.save({ translations, transaction: trx });
          updatedTubesCount++;
        }

        if (options.dryRun) {
          logger.info(`Dry run is enabled, stopping before updating ${updatedTubesCount} tube(s)`);
          await trx.rollback();
          return;
        }
        await trx.commit();
        logger.info(`Successfully updated translations for ${updatedTubesCount} tube(s)`);
      } catch (error) {
        logger.error('unhandled error found', { error });
        await trx.rollback();
      }
    });
  }
}

await ScriptRunner.execute(import.meta.url, UpdateTubesTranslationScript);
