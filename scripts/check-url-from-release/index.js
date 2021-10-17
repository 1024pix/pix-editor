const urlRegex = require('url-regex-safe');
const axios = require('axios');
const showdown = require('showdown');
const _ = require('lodash');
const Analyzer = require('image-url-checker/dist/analyzing/Analyzer').default;
const { getAuthToken, clearSpreadsheetValues, setSpreadsheetValues } = require('./google-sheet.js');

async function main() {
  const url = process.env.RELEASE_URL;
  const token = process.env.TOKEN_LCMS;
  const release = await getRelease(url, token);
  const challenges = getLiveChallenges(release);
  const spreadsheetId = process.env.SPREADSHEET_ID;
  const sheetNameRange = process.env.SHEET_NAME;

  const urlList = findUrlsFromChallenges(challenges);

  const separator = ',';
  const lines = urlList.map((line, index) => {
    return {
      reference: line.id,
      url: line.url,
      index,
      raw: [line.id, line.url].join(','),
      separator
    };
  });
  const options = {
    separator,
    output: 'result.csv',
    headers: ['User-Agent: Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:64.0) Gecko/20100101 Firefox/80.0'],
    bulk: 50,
  };
  const analyzer = new Analyzer(options);
  const analyzedLines = await analyzer.analyze(lines);
  const formatedLines = analyzedLines.filter((line) => {
    return line.status === 'KO';
  }).map((line) => {
    return [line.reference, line.url, line.status, line.error, line.comments.join(', ')];
  });
  try {
    const auth = await getAuthToken();
    await clearSpreadsheetValues({
      spreadsheetId,
      auth,
      range: `${sheetNameRange}!A2:Z999`,
    });
    await setSpreadsheetValues({
      spreadsheetId,
      auth,
      range: 'feuille_1!A:Z',
      valueInputOption: 'RAW',
      resource: {
        values: formatedLines
      }
    });
  } catch (error) {
    console.log(error.message, error.stack);
  }

}

function cleanUrl(url) {
  const index = url.indexOf('</');
  if (index >= 0) {
    return url.substr(0, index);
  }
  return url;
}

function prependProtocol(url) {
  if (!url.includes('http')) {
    url = 'https://' + url;
  }
  return url;
}

function findUrlsInstructionFromChallenge(challenge) {
  return findUrlsInMarkdown(challenge.instruction || '');
}

function findUrlsProposalsFromChallenge(challenge) {
  return findUrlsInMarkdown(challenge.proposals || '');
}

function findUrlsInMarkdown(value) {
  const converter = new showdown.Converter();
  const html = converter.makeHtml(value);
  const urls = html.match(urlRegex({ strict: true }));
  if (!urls) {
    return [];
  }
  return _.uniq(urls.map(cleanUrl).map(prependProtocol));
}

function findUrlsFromChallenges(challenges) {
  return challenges.flatMap((challenge) => {
    const functions = [
      findUrlsInstructionFromChallenge,
      findUrlsProposalsFromChallenge
    ];
    const urls = functions
      .flatMap((fun) => fun(challenge))
      .map((url) => ({ id: challenge.id, url }));

    return _.uniqBy(urls, 'url');
  });
}

async function getRelease(url, token) {
  const { data: { content: content } } = await axios.get(url, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  return content;
}

function getLiveChallenges(release) {
  return release.challenges.filter((challenge) => challenge.status !== 'périmé');
}

if (process.env.NODE_ENV !== 'test') {
  main();
}

module.exports = {
  findUrlsInMarkdown,
  findUrlsInstructionFromChallenge,
  findUrlsProposalsFromChallenge,
  findUrlsFromChallenges,
  getLiveChallenges
};
