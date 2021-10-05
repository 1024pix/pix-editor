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
    return findUrlsFromChallenge(challenge);
  });
}

module.exports = {
  findUrlsFromChallenge,
  findUrlsFromRelease
};
