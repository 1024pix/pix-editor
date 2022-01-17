require('dotenv').config({ path: __dirname + '/../../.env' });
const _ = require('lodash');
const { findUrlsInstructionFromChallenge, findUrlsProposalsFromChallenge } = require('../../lib/domain/usecases/validate-urls-from-release');
const releaseRepository = require('../../lib/infrastructure/repositories/release-repository');
const { disconnect } = require('../../db/knex-database-connection');

async function getExternalUrlsList() {
  const release = (await releaseRepository.getLatestRelease()).content;
  const skillIdsWithFramework = getSkillIdsWithFramework(release);
  const activeChallenges = getActiveChallenges(release.challenges);
  const urlsFromChallenges = findUrlsFromChallenges(activeChallenges, release);

  const baseUrl = function(url) {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol + '//' + parsedUrl.host;
  };

  urlsFromChallenges.forEach((urlChallenge) => {
    urlChallenge.origin = skillIdsWithFramework[urlChallenge.skillIds[0]];
    urlChallenge.url = baseUrl(urlChallenge.url);
  });

  const uniqUrls = _.uniqBy(urlsFromChallenges, 'url');

  uniqUrls.forEach(({ origin, url, locales, status }) => {
    console.log([origin, url, locales.join(';'), status].join(','));
  });
}

function findUrlsFromChallenges(challenges) {
  const urlsFromChallenges = challenges.flatMap((challenge) => {
    const functions = [
      findUrlsInstructionFromChallenge,
      findUrlsProposalsFromChallenge
    ];
    return functions
      .flatMap((fun) => fun(challenge))
      .map((url) => {
        return { id: challenge.id, locales: challenge.locales, url, skillIds: challenge.skillIds, status: challenge.status };
      });
  });
  return _.uniqBy(urlsFromChallenges, 'url');
}

function getSkillIdsWithFramework(release) {
  return release.competences.reduce((memo, competence) => {
    return {
      ...competence.skillIds.reduce((memo2, skillId) => {
        return {
          [skillId]: competence.origin,
          ...memo2
        };
      }, {}),
      ...memo
    };
  }, {});
}

function getActiveChallenges(challenges) {
  const challengeInactiveStatus = ['périmé', 'proposé'];
  return challenges.filter((challenge) =>  {
    return !challengeInactiveStatus.includes(challenge.status);
  });
}

getExternalUrlsList().finally(() => { disconnect(); });
