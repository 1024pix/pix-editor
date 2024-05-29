import { fileURLToPath } from 'node:url';
import Airtable from 'airtable';
import { disconnect, knex } from '../../db/knex-database-connection.js';
import { logger } from '../../lib/infrastructure/logger.js';

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

export async function fillMissingNameForThematicsInTranslationsTable({ airtableClient, dryRun }) {
  const {
    thematics,
    tubes,
    competences,
  } = await _fetchDataFromAirtable({ airtableClient });
  for (const competence of competences) {
    const thematicIdsWorkbench = [];
    const thematicIdsNotWorkbench = [];
    const thematicsForCompetence = thematics.filter((th) => competence.thematicIds.includes(th.id));
    for (const thematic of thematicsForCompetence) {
      const thematicKey = `thematic.${thematic.id}.name`;
      const res = await knex('translations').select('value').where({ key: thematicKey }).first();
      if (!res?.value) {
        const tubesForThematic = tubes.filter((tu) => thematic.tubeIds.includes(tu.id));
        if (tubesForThematic.length === 1 && tubesForThematic[0].name === '@workbench') {
          thematicIdsWorkbench.push(thematic.id);
          if (!dryRun) {
            const thematicName = `workbench_${competence.origin}_${competence.code.split('.').join('_')}`;
            await knex.insert({ value: thematicName, key: thematicKey, locale: 'fr' });
          }
        } else {
          thematicIdsNotWorkbench.push(thematic.id);
        }
      }
    }
    if (thematicIdsWorkbench.length + thematicIdsNotWorkbench.length > 0) {
      console.log(`Nombre de thématiques workbench corrigées pour la compétence ${competence.id}: ${thematicIdsWorkbench.length}`);
      console.log(`Nombre de thématiques NON workbench NON corrigées pour la compétence ${competence.id}: ${thematicIdsNotWorkbench.length} (${thematicIdsNotWorkbench.join(', ')})`);
    }
  }
}

async function _fetchDataFromAirtable({ airtableClient }) {
  const rawCompetences = await airtableClient
    .table('Competences')
    .select({
      fields: [
        'Record ID',
        'id persistant',
        'Origine2',
        'Sous-domaine',
        'Thematiques (id persistant)',
      ],
    })
    .all();
  const competences = rawCompetences.map((rawCompetence) => {
    return {
      recordId: rawCompetence.get('Record ID'),
      id: rawCompetence.get('id persistant'),
      origin: rawCompetence.get('Origine2'),
      code: rawCompetence.get('Sous-domaine'),
      thematicIds: rawCompetence.get('Thematiques (id persistant)') ?? [],
    };
  });

  const rawThematics = await airtableClient
    .table('Thematiques')
    .select({
      fields: [
        'Record Id',
        'id persistant',
        'Tubes (id persistant)',
      ],
    })
    .all();
  const thematics = rawThematics.map((rawThematic) => ({
    recordId: rawThematic.get('Record Id'),
    id: rawThematic.get('id persistant'),
    tubeIds: rawThematic.get('Tubes (id persistant)') ?? [],
  }));

  const rawTubes = await airtableClient
    .table('Tubes')
    .select({
      fields: [
        'id persistant',
        'Nom',
      ],
    })
    .all();
  const tubes = rawTubes.map((rawTube) => ({
    id: rawTube.get('id persistant'),
    name: rawTube.get('Nom'),
  }));

  return {
    thematics,
    tubes,
    competences,
  };
}

async function main() {
  if (!isLaunchedFromCommandLine) return;

  try {
    const airtableClient = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE);

    const dryRun = process.env.DRY_RUN !== 'false';

    if (dryRun) logger.warn('Dry run: no actual modification will be performed, use DRY_RUN=false to disable');

    await fillMissingNameForThematicsInTranslationsTable({ airtableClient, dryRun });
    console.log('All thematics have now name in translations table !');
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
}

main();
