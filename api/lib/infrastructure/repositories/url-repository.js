import * as google from '@googleapis/sheets';
import { logger } from '../logger.js';
import * as config from '../../config.js';
import { DomainTransaction } from '../../domain/DomainTransaction.js';

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

async function clearSpreadsheetValues({ spreadsheetId, auth, range }) {
  const res = await sheets.spreadsheets.values.clear({
    spreadsheetId,
    auth,
    range,
  });
  return res;
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

async function sendDataToGoogleSheet(dataToUpload, sheetName) {
  try {
    const auth = await getAuthClient(config.googleAuthCredentials);
    await clearSpreadsheetValues({
      spreadsheetId: config.checkUrlsJobs.spreadsheetId,
      auth,
      range: `${sheetName}!A2:Z9999`,
    });
    await setSpreadsheetValues({
      spreadsheetId: config.checkUrlsJobs.spreadsheetId,
      auth,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'RAW',
      resource: { values: dataToUpload },
    });
  } catch (error) {
    logger.error(error.message);
  }
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

export function updateChallenges(dataToUpload) {
  return sendDataToGoogleSheet(dataToUpload, config.checkUrlsJobs.challengesSheetName);
}

export async function updateTutorials(dataToUpload) {
  const finalDataToUpload = await keepUrlsThatFailedAtLeastTwiceInARow(dataToUpload);
  return sendDataToGoogleSheet(finalDataToUpload, config.checkUrlsJobs.tutorialsSheetName);
}

export async function exportExternalUrls(dataToUpload) {
  const sheetName = new Date().toLocaleDateString('fr-FR');
  await clearOlderSheets(config.exportExternalUrlsJob.spreadsheetId);
  return addSheetToGoogleSheet(dataToUpload, sheetName, config.exportExternalUrlsJob.spreadsheetId);
}

const TUTORIAL_KO_URLS_TABLE_NAME = 'tutorial_ko_urls';
const CONTINUOUS_FAILURE_MINIMUM_COUNT = 2;
async function keepUrlsThatFailedAtLeastTwiceInARow(dataToUpload) {
  const finalDataToUpload = [];
  await DomainTransaction.execute(async () => {
    const trx = DomainTransaction.getConnection();
    const tutorialKoUrlsInDB = await trx(TUTORIAL_KO_URLS_TABLE_NAME);

    const tutorialKoUrlsToInsertInDB = [];
    for (const itemToUpload of dataToUpload) {
      const [
        , , currentTutorialId,
        currentUrl,
      ] = itemToUpload;
      let currentContinuousKoCount
        = tutorialKoUrlsInDB.find(({ tutorialId, url }) => url === currentUrl && tutorialId === currentTutorialId)
          ?.continuousKoCount ?? 0;
      ++currentContinuousKoCount;
      tutorialKoUrlsToInsertInDB.push({
        url: currentUrl,
        tutorialId: currentTutorialId,
        continuousKoCount: currentContinuousKoCount,
      });
      if (currentContinuousKoCount >= CONTINUOUS_FAILURE_MINIMUM_COUNT) {
        finalDataToUpload.push(itemToUpload);
      }
    }

    await trx(TUTORIAL_KO_URLS_TABLE_NAME).del();
    await trx.batchInsert(TUTORIAL_KO_URLS_TABLE_NAME, tutorialKoUrlsToInsertInDB);
  });
  return finalDataToUpload;
}
