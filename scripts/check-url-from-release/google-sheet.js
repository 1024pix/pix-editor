const { google } = require('googleapis');
const sheets = google.sheets('v4');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getAuthToken() {
  const auth = new google.auth.GoogleAuth({
    scopes: SCOPES
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

module.exports = {
  getAuthToken,
  clearSpreadsheetValues,
  setSpreadsheetValues,
};
