import _ from 'lodash';

export async function exportExternalUrlsFromRelease({ releaseRepository, urlRepository, UrlUtils }) {
  const release = (await releaseRepository.getLatestRelease());
  const operativeChallenges = release.operativeChallenges;
  const urlsFromChallenges = findUrlsFromChallenges(operativeChallenges, release, UrlUtils);
  const dataToUpload = urlsFromChallenges.map(({ origin, url, locales, status, tube }) =>
    [origin, tube, url, locales.join(';'), status]);
  await urlRepository.exportExternalUrls(dataToUpload);
}

function findUrlsFromChallenges(challenges, release, UrlUtils) {
  const baseUrl = function(url) {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol + '//' + parsedUrl.host;
  };
  const urlsFromChallenges = challenges.flatMap((challenge) => {
    const functions = [
      (challenge) => UrlUtils.findUrlsInMarkdown(challenge.instruction),
      (challenge) => UrlUtils.findUrlsInMarkdown(challenge.proposals),
    ];
    return functions
      .flatMap((fun) => fun(challenge))
      .map((url) => {
        return {
          origin: release.findOriginForChallenge(challenge) ?? '',
          tube: release.findTubeNameForChallenge(challenge) ?? '',
          locales: challenge.locales,
          url: baseUrl(url),
          status: challenge.status,
        };
      });
  });
  return _.uniqBy(urlsFromChallenges, 'url');
}
