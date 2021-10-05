const urlRegex = require('url-regex-safe');
const axios = require('axios');
const fs = require('fs');

async function main() {
  const url = process.env.RELEASE_URL;
  const token = process.env.TOKEN_LCMS;
  const release = await getRelease(url, token);

  const urlList = findUrlsFromRelease(release);
  const csv = buildCsv(urlList);

  fs.writeFileSync('urlList.csv', csv);
}

function findUrlsFromChallenge(challenge) {
  const urls = (challenge.instruction || '').match(urlRegex({ strict: true }));
  if (!urls) {
    return [];
  }
  return urls;
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

if (process.env.NODE_ENV !== 'test') {
  main();
}

module.exports = {
  findUrlsFromChallenge,
  findUrlsFromRelease,
  buildCsv,
};

