// Populate the alpha and dela columns
// You must have 2 files:
//  - a csv file with the mapping between the hash and the challenge id: names file.csv
//  - a json file with hash and alpha and beta: file.json
// To run the script:
// > cd scripts
// > npm ci
// > AIRTABLE_API_KEY=XXX AIRTABLE_BASE=XXXX node populate-alpha-and-delta-column/

import _ from 'lodash';

import fs from 'fs';
import Airtable from 'airtable';
import { parseString } from '@fast-csv/parse';
import ProgressBar from 'progress';

export function matchData(csvData, jsonData) {
  return new Promise((resolve, reject) => {
    const result = [];

    parseString(csvData, { headers: true })
      .on('error', (error) => {
        console.error(error);
        reject(error);
      })
      .on('data', (row) => {
        const match = jsonData.find((objectJson) => {
          return objectJson.id === row.ChallengeIdHash;
        });
        if (match) {
          match.id = row.challengeId;
          result.push(match);
        }
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
  const json = JSON.parse(fs.readFileSync('./file.json', 'utf-8'));

  const base = getBaseChallenges();
  const matchedData = await matchData(csv, json);
  const matchedDataWithAirtableIds = await findAirtableIds(base, matchedData);
  await updateRecords(base, matchedDataWithAirtableIds);
}

if (process.env.NODE_ENV !== 'test') {
  main();
}
