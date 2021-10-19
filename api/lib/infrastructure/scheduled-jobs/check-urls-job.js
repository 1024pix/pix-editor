const showdown = require('showdown');
const _ = require('lodash');
const urlRegex = require('url-regex-safe');
const createQueue = require('./create-queue');
const releaseRepository = require('../repositories/release-repository');
const Analyzer = require('image-url-checker/dist/analyzing/Analyzer').default;
const queue = createQueue('check-urls-queue');
const { getAuthToken, clearSpreadsheetValues, setSpreadsheetValues }  = require('../utils/google-sheet');
const config = require('../../config');

const checkUrlsJobOptions = {
  attempts: config.scheduledJobs.attempts,
  backoff: { type: 'exponential', delay: 100 },
  removeOnComplete: true,
  removeOnFail: 1,
};

queue.process(checkUrlsFromRelease);

function getLiveChallenges(release) {
  return release.challenges.filter((challenge) => challenge.status !== 'périmé');
}

function findUrlsInstructionFromChallenge(challenge) {
  return findUrlsInMarkdown(challenge.instruction || '');
}

function findUrlsProposalsFromChallenge(challenge) {
  return findUrlsInMarkdown(challenge.proposals || '');
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

async function analyzeUrls(urlList) {
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
    headers: ['User-Agent: Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:64.0) Gecko/20100101 Firefox/80.0'],
    bulk: 50,
  };
  const analyzer = new Analyzer(options);
  const analyzedLines = await analyzer.analyze(lines);
  return analyzedLines;
}

function getDataToUpload(analyzedLines) {
  return analyzedLines.filter((line) => {
    return line.status === 'KO';
  }).map((line) => {
    return [line.reference, line.url, line.status, line.error, line.comments.join(', ')];
  });
}

async function sendDataToGoogleSheet(dataToUpload) {
  try {
    const auth = await getAuthToken(config.checkUrlsJobs.googleAuthCredentials);
    await clearSpreadsheetValues({
      spreadsheetId: config.checkUrlsJobs.spreadsheetId,
      auth,
      range: `${config.checkUrlsJobs.sheetName}!A2:Z999`,
    });
    await setSpreadsheetValues({
      spreadsheetId: config.checkUrlsJobs.spreadsheetId,
      auth,
      range: `${config.checkUrlsJobs.sheetName}!A:Z`,
      valueInputOption: 'RAW',
      resource: {
        values: dataToUpload
      }
    });
  } catch (error) {
    console.log(error.message, error.stack);
  }
}

async function checkUrlsFromRelease() {
  const release = await releaseRepository.getLatestRelease();
  const challenges = getLiveChallenges(release.content);

  const urlList = findUrlsFromChallenges(challenges);

  const analyzedLines = await analyzeUrls(urlList);
  const dataToUpload = getDataToUpload(analyzedLines);
  await sendDataToGoogleSheet(dataToUpload);
}

function start() {
  queue.add({}, checkUrlsJobOptions);
}

module.exports = {
  queue,
  getLiveChallenges,
  findUrlsInMarkdown,
  findUrlsInstructionFromChallenge,
  findUrlsProposalsFromChallenge,
  findUrlsFromChallenges,
  start,
};
