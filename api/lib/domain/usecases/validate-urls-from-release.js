const showdown = require('showdown');
const _ = require('lodash');
const urlRegex = require('url-regex-safe');
const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const logger = require('../../infrastructure/logger');

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

function findSkillsNameFromChallenge(challenge, release) {
  const skills = release.skills.filter(({ id }) => challenge.skillIds.includes(id));
  return skills.map((s) => s.name).join(' ');
}

function findSkillsNameFromTutorial(tutorial, release) {
  const skills = release.skills.filter((skill) => {
    return skill.tutorialIds.includes(tutorial.id) ||
      skill.learningMoreTutorialIds.includes(tutorial.id);
  });
  return skills.map((s) => s.name).join(' ');
}

function findUrlsFromChallenges(challenges, release) {
  return challenges.flatMap((challenge) => {
    const functions = [
      findUrlsInstructionFromChallenge,
      findUrlsProposalsFromChallenge
    ];
    const urls = functions
      .flatMap((fun) => fun(challenge))
      .map((url) => {
        return { id: [findSkillsNameFromChallenge(challenge, release), challenge.id, challenge.status].join(';'), url };
      });

    return _.uniqBy(urls, 'url');
  });
}

function findUrlsFromTutorials(tutorials, release) {
  return tutorials.map((tutorial) => {
    return { id: [findSkillsNameFromTutorial(tutorial, release), tutorial.id].join(';'), url: tutorial.link };
  });
}

async function analyzeUrls(urlList) {
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:64.0) Gecko/20100101 Firefox/80.0',
      'Accept': '*/*'
    },
    timeout: 15000,
    maxRedirects: 10,
    bulk: 50,
  };
  const analyzedLines = await analyze(urlList, options);
  return analyzedLines;
}

async function analyze(lines, options) {
  const pMap = (await import('p-map')).default;
  const newLines = await pMap(lines, async (line) => {
    const config = { timeout: options.timeout, maxRedirects: options.maxRedirects, headers: options.headers };
    try {
      new URL(line.url);
    } catch (e) {
      return { id: line.id, url: line.url, status: 'KO', error: 'FORMAT_ERROR', comments: e.message };
    }
    try {
      logger.trace(`checking ${line.url}`);
      const response = await checkUrl(line.url, config);
      if (response.status === 200) {
        return { id: line.id, url: line.url, status: 'OK', error: '', comments: '' };
      } else {
        return {
          id: line.id,
          url: line.url,
          status: 'KO',
          error: 'HTTP_ERROR',
          comments: 'HTTP status is not 200'
        };
      }
    } catch (e) {
      return { id: line.id, url: line.url, status: 'KO', error: 'HTTP_ERROR', comments: e.message };
    } finally {
      logger.trace(`done checking ${line.url}`);
    }
  }, { concurrency: options.bulk });
  return newLines;
}

async function checkUrl(url, config) {
  const jar = new CookieJar();
  const client = wrapper(axios.create({ jar }));
  try {
    return (await client.head(url, config));
  } catch (e) {
    return (await client.get(url, config));
  }
}

function getDataToUpload(analyzedLines) {
  return analyzedLines.filter((line) => {
    return line.status === 'KO';
  }).map((line) => {
    return [...line.id.split(';'), line.url, line.status, line.error, line.comments];
  });
}

async function validateUrlsFromRelease({ releaseRepository, urlErrorRepository }) {
  const release = await releaseRepository.getLatestRelease();

  await checkAndUploadKOUrlsFromChallenges(release, { urlErrorRepository });
  await checkAndUploadKOUrlsFromTutorials(release, { urlErrorRepository });
}

async function checkAndUploadKOUrlsFromChallenges(release, { urlErrorRepository }) {
  const challenges = getLiveChallenges(release.content);

  const urlList = findUrlsFromChallenges(challenges, release.content);

  const analyzedLines = await analyzeUrls(urlList);
  const dataToUpload = getDataToUpload(analyzedLines);
  await urlErrorRepository.updateChallenges(dataToUpload);
}

async function checkAndUploadKOUrlsFromTutorials(release, { urlErrorRepository }) {
  const tutorials = release.content.tutorials;

  const urlList = findUrlsFromTutorials(tutorials, release.content);

  const analyzedLines = await analyzeUrls(urlList);
  const dataToUpload = getDataToUpload(analyzedLines);
  await urlErrorRepository.updateTutorials(dataToUpload);
}

module.exports = {
  checkUrl,
  validateUrlsFromRelease,
  getLiveChallenges,
  findUrlsInMarkdown,
  findUrlsInstructionFromChallenge,
  findUrlsProposalsFromChallenge,
  findUrlsFromChallenges,
  findUrlsFromTutorials,
};
