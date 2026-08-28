import * as google from '@googleapis/sheets';
import { logger } from '../logger.js';
import * as config from '../../config.js';
import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { fetchPage } from '../utils/knex-utils.js';

const sheets = google.sheets('v4');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const DELETE_EXTERNAL_URL_SHEET_DELAY_MONTHS = 3;

async function getAuthClient(credentials) {
  const googleAuth = new google.auth.GoogleAuth({
    scopes: SCOPES,
    credentials,
  });
  return googleAuth.getClient();
}

async function setSpreadsheetValues({ spreadsheetId, auth, range, valueInputOption, resource }) {
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId,
    auth,
    range,
    valueInputOption,
    resource,
  });
  return res;
}

async function addSheetToGoogleSheet(dataToUpload, sheetName, spreadsheetId) {
  try {
    const auth = await getAuthClient(config.googleAuthCredentials);
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId, auth });
    const isNameForNewSheetAvailable
      = spreadsheet.data.sheets.filter((sheet) => sheet.properties.title === sheetName).length === 0;
    if (isNameForNewSheetAvailable) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        auth,
        resource: { requests: [{ addSheet: { properties: { title: sheetName } } }] },
      });
      await setSpreadsheetValues({
        spreadsheetId,
        auth,
        range: `${sheetName}!A:Z`,
        valueInputOption: 'RAW',
        resource: { values: dataToUpload },
      });
    } else {
      logger.error(`A sheet with the name "${sheetName}" already exists in spreadsheet`);
    }
  } catch (error) {
    logger.error(error.message);
  }
}

async function clearOlderSheets(spreadsheetId) {
  try {
    const auth = await getAuthClient(config.googleAuthCredentials);
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId, auth });
    const limitDate = new Date();
    limitDate.setMonth(new Date().getMonth() - DELETE_EXTERNAL_URL_SHEET_DELAY_MONTHS);
    const isSheetOlderThanLimitDate = function(sheetTitle, limitDate) {
      const standardFormattedDate = sheetTitle.split('/').reverse().join('-');
      const sheetDate = new Date(standardFormattedDate);
      if (isNaN(sheetDate)) {
        return false;
      }
      return sheetDate.getTime() < limitDate.getTime();
    };
    const sheetsToDelete = spreadsheet.data.sheets.filter((sheet) =>
      isSheetOlderThanLimitDate(sheet.properties.title, limitDate),
    );
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      auth,
      resource: {
        requests: sheetsToDelete.map((sheetToDelete) => {
          return { deleteSheet: { sheetId: sheetToDelete.properties.sheetId } };
        }),
      },
    });
  } catch (error) {
    logger.error(error.message);
  }
}

export async function updateChallenges(challengeUrls) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('challenge_external_urls').truncate();
  return knexConn.batchInsert('challenge_external_urls', challengeUrls, 500);
}

export async function updateTutorials(tutorialUrls) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('tutorial_external_urls').truncate();
  return knexConn.batchInsert('tutorial_external_urls', tutorialUrls, 500);
}

export async function get() {
  const knexConn = DomainTransaction.getConnection();
  const challengeExternalUrlsDto = await knexConn('challenge_external_urls').orderBy('id');
  const tutorialExternalUrlsDto = await knexConn('tutorial_external_urls').orderBy('id');
  return {
    challengeExternalUrls: challengeExternalUrlsDto,
    tutorialExternalUrls: tutorialExternalUrlsDto,
  };
}

/**
 * @param {object} page
 * @param {number} page.number page number
 * @param {number} page.size page size
 */
export async function getWithPagination(page) {
  const knex = DomainTransaction.getConnection();
  const getQuery = knex
    .select(knex.raw('challenge_id AS id'), 'url', knex.raw('\'challenge\' AS type'))
    .from('challenge_external_urls')
    .unionAll(function() {
      this.select(knex.raw('tutorial_id AS id'), 'url', knex.raw('\'tutorial\' AS type')).from('tutorial_external_urls');
    })
    .orderBy('type', 'id');

  const { results: externalUrlDTOs } = await fetchPage(getQuery, page);
  return externalUrlDTOs;
}

export async function getChallengesFromUrl(urlList) {
  const knex = DomainTransaction.getConnection();
  return knex('challenge_external_urls').whereIn('url', urlList).orderBy('id');
}

export async function getTutorialsFromUrl(urlList) {
  const knex = DomainTransaction.getConnection();
  return knex.select('*').from('tutorials').whereIn('link', urlList).orderBy('id');
}

export async function exportExternalUrls(dataToUpload) {
  const sheetName = new Date().toLocaleDateString('fr-FR');
  await clearOlderSheets(config.exportExternalUrlsJob.spreadsheetId);
  return addSheetToGoogleSheet(dataToUpload, sheetName, config.exportExternalUrlsJob.spreadsheetId);
}
