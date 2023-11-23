// Populate the alpha and dela columns
// You must have 1 file:
//  - a csv file with challengId, alpha and beta columns
// To run the script:
// > cd scripts
// > npm ci
// > AIRTABLE_API_KEY=XXX AIRTABLE_BASE=XXXX node populate-alpha-and-delta-column-with-csv/

import _ from 'lodash';

import fs from 'fs';
import Airtable from 'airtable';
import { parseString } from '@fast-csv/parse';
import ProgressBar from 'progress';

const HEADERS_MAPPING = {
  items: 'id',
  difficulties: 'delta',
  discriminants: 'alpha',
};

export function parseData(csvData) {
  return new Promise((resolve, reject) => {
    const result = [];

    parseString(csvData, { headers: (headers) => headers.map((h) => HEADERS_MAPPING[h]) })
      .on('error', (error) => {
        console.error(error);
        reject(error);
      })
      .on('data', (row) => {
        result.push(row);
      })
      .on('end', () => resolve(result));
  });
}

export async function findAirtableIds(base, challengesWithPersistentIds) {
  const challengesWithPersistentIdsWithChunk = _.chunk(challengesWithPersistentIds, 100);
  const promises = challengesWithPersistentIdsWithChunk.map((chunk) => {
    return base
      .select({
        fields: ['Record ID', 'id persistant'],
        filterByFormula: 'OR(' + chunk.map(({ id }) => `'${id}' = {id persistant}`).join(',') + ')',
      })
      .all();
  });
  const airtableRecords = (await Promise.all(promises)).flat();

  return airtableRecords.map((airtableRecord) => {
    const data = challengesWithPersistentIds.find((row) => row.id === airtableRecord.get('id persistant'));
    return {
      ...data,
      id: airtableRecord.id
    };
  });
}

export async function updateRecords(base, data) {
  const payloadWithoutLimit = data.map(({ id, alpha, delta }) => {
    return {
      id,
      fields: {
        'Difficulté calculée': `${delta}`,
        'Discrimination calculée': `${alpha}`
      },
    };
  });
  const payloadByChunk = _.chunk(payloadWithoutLimit, 10);
  const bar = new ProgressBar('[:bar] :percent', {
    total: payloadByChunk.length,
    width: 50,
  });
  const promises = payloadByChunk.map((payload) => {
    return new Promise((resolve, reject) => {
      base.update(
        payload,
        (err) => {
          bar.tick();
          if (err) reject();
          else resolve();
        });
    });
  });
  return Promise.all(promises);
}

function getBaseChallenges() {
  const base = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY
  }).base(process.env.AIRTABLE_BASE);

  return base('Epreuves');
}

async function main() {
  const csv = fs.readFileSync('./file.csv', 'utf-8');

  const base = getBaseChallenges();
  const matchedData = await parseData(csv);
  const matchedDataWithAirtableIds = await findAirtableIds(base, matchedData);
  await updateRecords(base, matchedDataWithAirtableIds);
}

if (process.env.NODE_ENV !== 'test') {
  main();
}
