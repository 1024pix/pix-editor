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
  return table.fields.map((field) => {
    let key = `${table.name}.${field.name}.${field.type}`;
    if (field.type === 'formula') {
      let simplifiedFormula = field.options.formula;
      for (const fieldId of field.options.referencedFieldIds) {
        const fieldName = table.fields.find((field) => field.id === fieldId).name;
        simplifiedFormula = simplifiedFormula.replaceAll(fieldId, `\`${fieldName}\``);
      }
      key += `=\`${simplifiedFormula}\``;
    }
    if (['singleSelect', 'multipleSelects'].includes(field.type)) {
      const options = field.options.choices.map(({ name }) => name).toSorted().join('/');
      key += `:${options}`;
    }
    return key;
  });
}

async function main() {
  if (!isLaunchedFromCommandLine) return;
  try {
    // Throw all env errors at once for faster feedback
    const missingEnvErrors = [];

    // Jeton d'accès `read-schema-only`
    const apiKey = process.env.AIRTABLE_READ_ONLY_API_KEY;
    if (!apiKey) missingEnvErrors.push('🕵️ Missing AIRTABLE_READ_ONLY_API_KEY environment variable');

    const reviewAppsBaseId = process.env.AIRTABLE_BASE_REVIEW_APPS;
    if (!reviewAppsBaseId) missingEnvErrors.push('🕵️ Missing AIRTABLE_BASE_REVIEW_APPS environment variable');

    const integrationBaseId = process.env.AIRTABLE_BASE_INTEGRATION;
    if (!integrationBaseId) missingEnvErrors.push('🕵️ Missing AIRTABLE_BASE_INTEGRATION environment variable');

    const prodBaseId = process.env.AIRTABLE_BASE_PROD;
    if (!prodBaseId) missingEnvErrors.push('🕵️ Missing AIRTABLE_BASE_PROD environment variable');

    if (missingEnvErrors.length > 0) {
      throw new Error(missingEnvErrors.join(',\n'));
    }

    for (const [env, id] of [
      ['REVIEW_APPS', reviewAppsBaseId],
      ['INTEGRATION', integrationBaseId],
      ['PRODUCTION', prodBaseId],
    ]) {
      console.info(`📥 Fetching schema for base '${env}' ...`);
      const baseTableSchemas = await fetchTableSchemas({ baseId: id, apiKey });
      const keys = baseTableSchemas.flatMap(getFieldKeys).sort();

      const resultFileName = `COMPARE_SCRIPT_schema_keys_for_${env}.json`;
      await writeFile(resultFileName, JSON.stringify(keys, null, 2));
    }
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

main();
