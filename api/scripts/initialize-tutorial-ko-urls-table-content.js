import 'dotenv/config';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { disconnect, knex } from '../db/knex-database-connection.js';
import { google } from 'googleapis';
import { logger } from '../lib/infrastructure/logger.js';
import * as config from '../lib/config.js';

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);

  const authInstance = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    credentials: config.googleAuthCredentials,
  });
  const auth = await authInstance.getClient();
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: config.checkUrlsJobs.spreadsheetId,
    range: `${config.checkUrlsJobs.tutorialsSheetName}!A:Z`,
  });
  const values = res.data.values;
  const dataToInsert = values.map((value) => ({
    url: value[3],
    continuousKoCount: 1,
  }));
  await knex('tutorial_ko_urls').insert(dataToInsert);

  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  logger.info(`Script has ended: took ${duration} milliseconds`);
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();
