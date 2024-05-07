import _ from 'lodash';

export async function exportExternalUrlsFromRelease({ releaseRepository, UrlUtils }) {
  const release = (await releaseRepository.getLatestRelease());
  const operativeChallenges = release.operativeChallenges;
  const urlsFromChallenges = findUrlsFromChallenges(operativeChallenges, UrlUtils);

  const baseUrl = function(url) {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol + '//' + parsedUrl.host;
  };

  urlsFromChallenges.forEach((urlChallenge) => {
    urlChallenge.origin = release.findOriginForChallenge(urlChallenge.challenge) ?? '';
    urlChallenge.url = baseUrl(urlChallenge.url);
    urlChallenge.tube = release.findTubeNameForChallenge(urlChallenge.challenge) ?? '';
  });

  const uniqUrls = _.uniqBy(urlsFromChallenges, 'url');

  uniqUrls.forEach(({ origin, url, locales, status, tube }) => {
    console.log([origin, tube, url, locales.join(';'), status].join(','));
  });
}

function findUrlsFromChallenges(challenges, UrlUtils) {
  const urlsFromChallenges = challenges.flatMap((challenge) => {
    const functions = [
      (challenge) => UrlUtils.findUrlsInMarkdown(challenge.instruction),
      (challenge) => UrlUtils.findUrlsInMarkdown(challenge.proposals),
    ];
    return functions
      .flatMap((fun) => fun(challenge))
      .map((url) => {
        return { challenge: challenge, id: challenge.id, locales: challenge.locales, url, skillId: challenge.skillId, status: challenge.status };
      });
  });
  return _.uniqBy(urlsFromChallenges, 'url');
}
