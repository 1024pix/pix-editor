const urlRegex = require('url-regex-safe');
const axios = require('axios');
const fs = require('fs');
const showdown = require('showdown');
const _ = require('lodash');

async function main() {
  const url = process.env.RELEASE_URL;
  const token = process.env.TOKEN_LCMS;
  const release = await getRelease(url, token);
  const challenges = getLiveChallenges(release);

  const urlList = findUrlsFromChallenges(challenges);
  const csv = buildCsv(urlList);

  fs.writeFileSync('urlList.csv', csv);
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
  return findUrl(challenge.instruction || '');
}

function findUrlsProposalsFromChallenge(challenge) {
  return findUrl(challenge.proposals || '');
}

function findUrl(value) {
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
    const instructionsUrl = findUrlsInstructionFromChallenge(challenge).map((url) => ({ id: challenge.id, url }));
    const proposalsUrl = findUrlsProposalsFromChallenge(challenge).map((url) => ({ id: challenge.id, url }));
    return _.uniqBy([...instructionsUrl, ...proposalsUrl], 'url');
  });
}

function buildCsv(urlList) {
  return urlList.map((currentUrl) => `${currentUrl.id},${currentUrl.url}`).join('\n');
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
  findUrl,
  findUrlsInstructionFromChallenge,
  findUrlsProposalsFromChallenge,
  findUrlsFromChallenges,
  buildCsv,
  getLiveChallenges
};

