import { fileURLToPath } from 'node:url';
const __dirname = fileURLToPath(new URL('.', import.meta.url));
import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/../../.env' });
import _ from 'lodash';
import { findUrlsInstructionFromChallenge, findUrlsProposalsFromChallenge } from '../../lib/domain/usecases/validate-urls-from-release.js';
import { releaseRepository } from '../../lib/infrastructure/repositories/index.js';
import { disconnect } from '../../db/knex-database-connection.js';

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
    urlChallenge.origin = skillIdsWithFramework[urlChallenge.skillId];
    urlChallenge.url = baseUrl(urlChallenge.url);
    urlChallenge.tube = getTubeName(release, urlChallenge);
  });

  const uniqUrls = _.uniqBy(urlsFromChallenges, 'url');

  uniqUrls.forEach(({ origin, url, locales, status, tube }) => {
    console.log([origin, tube, url, locales.join(';'), status].join(','));
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
        return { id: challenge.id, locales: challenge.locales, url, skillId: challenge.skillId, status: challenge.status };
      });
  });
  return _.uniqBy(urlsFromChallenges, 'url');
}

function getTubeName(release, challenge) {
  const skill = release.skills.find((skill) => {
    return skill.id === challenge.skillId;
  });
  const tube = release.tubes.find((tube) => {
    return tube.id === skill.tubeId;
  });
  return tube.name;
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
