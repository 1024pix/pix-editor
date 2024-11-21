import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { writeFile } from 'node:fs/promises';
import * as dotenv from 'dotenv';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

export async function fetchTableSchemas({ baseId, apiKey }) {
  const res = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    credentials: 'include',
  });
  const body = await res.json();
  return body.tables;
}

function getFieldKeys(table) {
  const keys = [];
  for (const field of table.fields) {
    const fieldKey = `${table.name}.${field.name}.${field.type}`;
    keys.push(fieldKey);
  }
  return keys;
}

async function main() {
  if (!isLaunchedFromCommandLine) return;
  try {
    const apiKey = process.env.AIRTABLE_API_KEY;
    if (!apiKey) throw new Error('Missing Airtable API key');

    const reviewAppsBaseId = process.env.AIRTABLE_BASE;
    if (!reviewAppsBaseId) throw new Error('Missing Review Apps base id');

    const integrationBaseId = process.env.AIRTABLE_BASE_INTEGRATION;
    if (!integrationBaseId) throw new Error('Missing Integration base id');

    const prodBaseId = process.env.AIRTABLE_BASE_PROD;
    if (!prodBaseId) throw new Error('Missing Prod base id');

    for (const [env, id] of [['RA', reviewAppsBaseId], ['INTEG', integrationBaseId], ['PROD', prodBaseId]]) {
      const reviewAppsTableSchemas = await fetchTableSchemas({ baseId: id, apiKey });
      const keys = reviewAppsTableSchemas.flatMap(getFieldKeys).sort();

      const resultFileName = `COMPARE_SCRIPT_schema_${env}.json`;
      await writeFile(resultFileName, JSON.stringify(keys, null, 2));
    }

  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

main();
