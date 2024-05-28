import { fileURLToPath } from 'node:url';
import Airtable from 'airtable';
import _ from 'lodash';
import { disconnect } from '../../db/knex-database-connection.js';
import { generateNewId } from '../../lib/infrastructure/utils/id-generator.js';

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

export async function fixMissingIdPersistantForThematics({ airtableClient }) {
  const thematicsWithoutIdPersistant = await fetchThematicsWithoutIdPersistant({ airtableClient });
  console.log(`About to fix ${thematicsWithoutIdPersistant.length} thematics without id persistant.`);
  const thematicsToUpdate = [];
  for (const thematic of thematicsWithoutIdPersistant) {
    thematicsToUpdate.push({
      id: thematic.recordId,
      fields: {
        'id persistant': generateNewId('thematic'),
      }
    });
  }

  for (const thematicChunk of _.chunk(thematicsToUpdate, 10)) {
    await airtableClient.table('Thematiques').update(thematicChunk);
  }
}

async function fetchThematicsWithoutIdPersistant({ airtableClient }) {
  const rawThematics = await airtableClient
    .table('Thematiques')
    .select({
      fields: [
        'Record Id',
      ],
      filterByFormula: '{id persistant} = BLANK()'
    })
    .all();

  return rawThematics.map((rawThematic) => {
    return {
      recordId: rawThematic.get('Record Id'),
    };
  });
}

async function main() {
  if (!isLaunchedFromCommandLine) return;

  try {
    const airtableClient = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE);

    await fixMissingIdPersistantForThematics({ airtableClient });
    console.log('All thematics have now an "id persistant" !');
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
}

main();
