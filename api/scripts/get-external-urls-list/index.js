require('dotenv').config();
const _ = require('lodash');
const { findUrlsFromChallenges } = require('../../lib/domain/usecases/validate-urls-from-release');
const releaseRepository = require('../../lib/infrastructure/repositories/release-repository');
const { disconnect } = require('../../db/knex-database-connection');

async function getExternalUrlsList() {
  const release = (await releaseRepository.getLatestRelease()).content;
  const activeChallenges = getActiveChallenges(release);
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

function getActiveChallenges(release) {
  const challengeInactiveStatus = ['périmé', 'proposé'];
  return release.challenges.filter((challenge) => !challengeInactiveStatus.includes(challenge.status));
}

getExternalUrlsList().finally(() => { disconnect() });
