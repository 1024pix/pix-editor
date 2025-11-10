// Populate the alpha and dela columns
// You must have 1 file:
//  - a csv file with challengId, alpha and beta columns
// To run the script:
// > cd scripts
// > npm ci
// > node populate-alpha-and-delta-column-with-csv/

import _ from 'lodash';

import fs from 'fs';
import { parseString } from '@fast-csv/parse';
import { knex } from '../db/knex-database-connection';

const HEADERS_MAPPING = {
  items: 'id',
  difficulties: 'delta',
  discriminants: 'alpha',
};

const getMissingHeaders = (headers) => Object.keys(HEADERS_MAPPING).filter((h) => !headers.includes(h));

export function parseData(csvData) {
  return new Promise((resolve, reject) => {
    const result = [];

    parseString(csvData, {
      headers: (headers) => {
        const missingHeaders = getMissingHeaders(headers);
        if (missingHeaders.length > 0) {
          reject(new Error(`Missing header: ${missingHeaders.join(',')}`));
        }
        return headers.map((h) => HEADERS_MAPPING[h]);
      },
    })
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

async function main() {
  const csv = fs.readFileSync('./file.csv', 'utf-8');

  await knex('challenges').update({ alpha: null, delta: null });
  console.log('Parsing CSV Data');
  const matchedData = await parseData(csv);
  console.log('Updating records');
  for (const data of matchedData) {
    await knex('challenges').update({ alpha: data.alpha, delta: data.delta }).where({ id: data.id });
  }
}

if (process.env.NODE_ENV !== 'test') {
  main();
}
