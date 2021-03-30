const axios = require('axios');
const _ = require('lodash');
const hasha = require('hasha');
const pLimit = require('p-limit');
const limit = pLimit(100);
const ProgressBar = require('progress');
const diff = require('variable-diff');

module.exports = {
  compareReleases,
  replaceAttachmentsUrlByChecksum,
};

async function main() {
  const baseUrl1 = process.env.URL1;
  const baseUrl2 = process.env.URL2;
  const token1 = process.env.TOKEN1;
  const token2 = process.env.TOKEN2;

  const differences = await compareReleases(
    { url: baseUrl1, token: token1 },
    { url: baseUrl2, token: token2 },
    remoteChecksumComputer
  );

  console.log(differences);
}

function replaceAttachmentsWithProgress(challenges, remoteChecksumComputer) {
  const bar = new ProgressBar('Replacing attachments url by checksum [:bar] :percent', {
    total: challenges.length,
    width: 50,
  });

  return Promise.all(challenges.map(async (challenge) => {
    return limit(async () => {
      const newChallenge = await replaceAttachmentsUrlByChecksum(challenge, remoteChecksumComputer);
      bar.tick();
      return newChallenge;
    });
  }));
}

async function compareReleases({ url: urlLeft, token: tokenLeft }, { url: urlRight, token: tokenRight }, remoteChecksumComputer) {
  const challengesLeft = await getRelease(urlLeft, tokenLeft);
  const challengesRight = await getRelease(urlRight, tokenRight);

  const newChallengesLeft = await replaceAttachmentsWithProgress(challengesLeft, remoteChecksumComputer);
  const newChallengesRight = await replaceAttachmentsWithProgress(challengesRight, remoteChecksumComputer);

  const diffs = [];

  newChallengesLeft.forEach((challengeLeft) => {
    const challengeRight = newChallengesRight.find((challenge) => challenge.id === challengeLeft.id);

    if (!_.isEqual(challengeLeft, challengeRight)) {
      diffs.push(challengeLeft.id);
      const difference = diff(challengeLeft, challengeRight)
      console.log(challengeLeft.id, difference.text);
    }
  });
  if (newChallengesLeft.length !== newChallengesRight.length) {
    console.log('The number of challenges differ between the 2 releases')
    const missingIds = _.map(_.difference(newChallengesRight, newChallengesLeft), 'id');
    diffs.push(...missingIds);
  }
  return diffs;
}


async function getRelease(url, token) {
  const { data: { content: { challenges } } } = await axios.get(url, {
    headers: { 'Authorization': 'Bearer '+ token }
  });
  return challenges;
}

async function replaceAttachmentsUrlByChecksum(challenge, remoteChecksumComputer) {
  if (challenge.illustrationUrl) {
    challenge.illustrationUrl = await remoteChecksumComputer(challenge.illustrationUrl);
  }
  if (challenge.illustrationAlt) {
    challenge.illustrationAlt = sanitizeText(challenge.illustrationAlt);
  }
  if (challenge.attachments) {
    const newAttachments = [];
    for (const attachment of challenge.attachments) {
      newAttachments.push(await remoteChecksumComputer(attachment));
    }
    challenge.attachments = newAttachments.sort();
  }
  return challenge;
}

function sanitizeText(text) {
  if (text) {
    return text.replace(/ \n/gm, '\n')
  }
  return ''
}

async function remoteChecksumComputer(url) {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  return hasha.fromStream(response.data, { algorithm: 'sha1' });
}

if (process.env.NODE_ENV !== 'test') {
  main();
}
