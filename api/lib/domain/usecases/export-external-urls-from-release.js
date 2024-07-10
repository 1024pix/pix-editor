import _ from 'lodash';

export async function exportExternalUrlsFromRelease({ releaseRepository, urlRepository, localizedChallengeRepository, UrlUtils }) {
  const release = await releaseRepository.getLatestRelease();
  const { operativeChallenges } = release;
  const localizedChallengesById = _.keyBy(await localizedChallengeRepository.list(), 'id');
  const urlsFromChallenges = findUrlsFromChallenges(operativeChallenges, localizedChallengesById, release, UrlUtils);
  const dataToUpload = urlsFromChallenges.map(({ origin, url, locales, status, tube }) =>
    [origin, tube, url, locales.join(';'), status]);
  await urlRepository.exportExternalUrls(dataToUpload);
}

function findUrlsFromChallenges(challenges, localizedChallengesById, release, UrlUtils) {
  const urlsFromChallenges = challenges.flatMap((challenge) => {
    const functions = [
      (challenge) => UrlUtils.findUrlsInMarkdown(challenge.instruction),
      (challenge) => UrlUtils.findUrlsInMarkdown(challenge.proposals),
      (challenge) => UrlUtils.findUrlsInMarkdown(challenge.solution),
      (challenge) => UrlUtils.findUrlsInMarkdown(challenge.solutionToDisplay),
      (challenge) => localizedChallengesById[challenge.id].urlsToConsult ?? [],
    ];
    return functions
      .flatMap((fun) => fun(challenge))
      .map((url) => {
        return {
          origin: release.findOriginForChallenge(challenge) ?? '',
          tube: release.findTubeNameForChallenge(challenge) ?? '',
          locales: challenge.locales,
          url: UrlUtils.getOrigin(url),
          status: challenge.status,
        };
      });
  });
  return _.uniqBy(urlsFromChallenges, 'url');
}
