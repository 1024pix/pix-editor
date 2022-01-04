const { google } = require('googleapis');
const sheets = google.sheets('v4');
const logger = require('../logger');
const config = require('../../config');

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
    const auth = await getAuthToken(config.checkUrlsJobs.googleAuthCredentials);
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

function updateChallenges(dataToUpload) {
  return sendDataToGoogleSheet(dataToUpload, config.checkUrlsJobs.challengesSheetName);
}

function updateTutorials(dataToUpload) {
  return sendDataToGoogleSheet(dataToUpload, config.checkUrlsJobs.tutorialsSheetName);
}

module.exports = {
  updateChallenges,
  updateTutorials
};
