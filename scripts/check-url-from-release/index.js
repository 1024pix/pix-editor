const urlRegex = require('url-regex-safe');

function findUrlsFromChallenge(challenge) {
  const urls = challenge.instruction.match(urlRegex());
  if (!urls) {
    return [];
  }
  return urls;
}

function findUrlsFromRelease(release) {
  return release.challenges.flatMap((challenge) => {
    return findUrlsFromChallenge(challenge).map(url => ({ id: challenge.id, url }));
  });
}

function buildCsv(urlList) {
  return urlList.map(currentUrl => `${currentUrl.id},${currentUrl.url}`).join('\n');
}

module.exports = {
  findUrlsFromChallenge,
  findUrlsFromRelease,
  buildCsv,
};
