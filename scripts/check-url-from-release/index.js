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
  return findUrlsInMarkdown(challenge.instruction || '');
}

function findUrlsProposalsFromChallenge(challenge) {
  return findUrlsInMarkdown(challenge.proposals || '');
}

function findUrlsSolutionFromChallenge(challenge) {
  return findUrlsInMarkdown(challenge.solution || '');
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
      findUrlsProposalsFromChallenge,
      findUrlsSolutionFromChallenge
    ];
    const urls = functions
      .flatMap((fun) => fun(challenge))
      .map((url) => ({ id: challenge.id, url }));

    return _.uniqBy(urls, 'url');
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
  findUrlsInMarkdown,
  findUrlsInstructionFromChallenge,
  findUrlsProposalsFromChallenge,
  findUrlsSolutionFromChallenge,
  findUrlsFromChallenges,
  buildCsv,
  getLiveChallenges
};
