import { google } from 'googleapis';
import { logger } from '../logger.js';
import * as config from '../../config.js';

const sheets = google.sheets('v4');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getAuthToken(credentials) {
  const auth = new google.auth.GoogleAuth({
    scopes: SCOPES,
    credentials,
  });

  const authToken = await auth.getClient();
  return authToken;
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
    const auth = await getAuthToken(config.googleAuthCredentials);
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
      resource: {
        values: dataToUpload
      }
    });
  } catch (error) {
    logger.error(error.message);
  }
}

async function addSheetToGoogleSheet(dataToUpload, sheetName, spreadsheetId) {
  try {
    const auth = await getAuthToken(config.googleAuthCredentials);
    if ((await sheets.spreadsheets.get({ spreadsheetId, auth })).data.sheets
      .filter((sheet) => sheet.properties.title === sheetName).length === 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        auth,
        resource: { requests: [ { addSheet: { properties: { title: sheetName } } }] } });
      await setSpreadsheetValues({
        spreadsheetId,
        auth,
        range: `${sheetName}!A:Z`,
        valueInputOption: 'RAW',
        resource: {
          values: dataToUpload
        }
      });
    } else {
      logger.error(`A sheet with the name "${sheetName}" already exists in spreadsheet`);
    }
  } catch (error) {
    logger.error(error.message);
  }
}

export function updateChallenges(dataToUpload) {
  return sendDataToGoogleSheet(dataToUpload, config.checkUrlsJobs.challengesSheetName);
}

export function updateTutorials(dataToUpload) {
  return sendDataToGoogleSheet(dataToUpload, config.checkUrlsJobs.tutorialsSheetName);
}

export function exportExternalUrls(dataToUpload) {
  const sheetName = new Date().toLocaleDateString('fr-FR');
  return addSheetToGoogleSheet(dataToUpload, sheetName, config.exportExternalUrlsJob.spreadsheetId);
}
