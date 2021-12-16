require('dotenv').config({ path: __dirname + '/../../.env' });
const _ = require('lodash');
const { findUrlsFromChallenges } = require('../../lib/domain/usecases/validate-urls-from-release');
const releaseRepository = require('../../lib/infrastructure/repositories/release-repository');
const { disconnect } = require('../../db/knex-database-connection');

async function getExternalUrlsList() {
  const release = (await releaseRepository.getLatestRelease()).content;
  const skillIdsFromPixFramework = getActiveSkillIdsFromPixFramework(release);
  const challengesFromPixFramework = getChallengesFromPixFramework(release, skillIdsFromPixFramework);
  const activeChallenges = getActiveChallenges(challengesFromPixFramework);
  const urlsFromChallenges = findUrlsFromChallenges(activeChallenges, release);

  const urls = urlsFromChallenges.map(({ url }) => {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol + '//' + parsedUrl.host;
  });

  const uniqUrls = _.uniq(urls).filter((url) => {
    return !url.includes('epreuves.pix.fr');
  });

  uniqUrls.forEach((url) => {
    console.log(url);
  });
}

function getActiveSkillIdsFromPixFramework(release) {
  const competencesFromPixFramework = release.competences.filter((competence) =>  competence.origin === 'Pix');
  const skillIds = competencesFromPixFramework.flatMap((competence) => competence.skillIds);
  return getActiveSkillIds(release, skillIds);
}

function getChallengesFromPixFramework(release, skillIds) {
  return release.challenges.filter((challenge) => skillIds.includes(challenge.skillIds[0]));
}

function getActiveChallenges(challenges) {
  const challengeInactiveStatus = ['périmé', 'proposé'];
  return challenges.filter((challenge) =>  {
    return !challengeInactiveStatus.includes(challenge.status) && !challenge.locales.includes('en');
  });
}

function getActiveSkillIds(release, skillIds) {
  const skills = release.skills;
  return skills.reduce((acc, skill) => {
    if (skillIds.includes(skill.id) && skill.name !== '@workbench') {
      acc.push(skill.id);
    }
    return acc;
  }, []);
}

getExternalUrlsList().finally(() => { disconnect(); });
