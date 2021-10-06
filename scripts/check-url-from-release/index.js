const urlRegex = require('url-regex-safe');
const axios = require('axios');
const fs = require('fs');
const showdown = require('showdown');
const _ = require('lodash');

async function main() {
  const url = process.env.RELEASE_URL;
  const token = process.env.TOKEN_LCMS;
  const release = await getRelease(url, token);

  const urlList = findUrlsFromRelease(release);
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

function findUrlsFromChallenge(challenge) {
  const converter = new showdown.Converter();
  const instruction = converter.makeHtml(challenge.instruction || '');
  const urls = instruction.match(urlRegex({ strict: true }));
  if (!urls) {
    return [];
  }
  return _.uniq(urls.map(cleanUrl).map(prependProtocol));
}

function findUrlsFromRelease(release) {
  return release.challenges.flatMap((challenge) => {
    return findUrlsFromChallenge(challenge).map((url) => ({ id: challenge.id, url }));
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
  findUrlsFromChallenge,
  findUrlsFromRelease,
  buildCsv,
  getLiveChallenges
};

