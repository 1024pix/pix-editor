import _ from 'lodash';

export async function exportExternalUrlsFromRelease({ releaseRepository, UrlUtils }) {
  const release = (await releaseRepository.getLatestRelease()).content;
  const skillIdsWithFramework = getSkillIdsWithFramework(release);
  const operativeChallenges = release.operativeChallenges;
  const urlsFromChallenges = findUrlsFromChallenges(operativeChallenges, UrlUtils);

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

function findUrlsFromChallenges(challenges, UrlUtils) {
  const urlsFromChallenges = challenges.flatMap((challenge) => {
    const functions = [
      (challenge) => UrlUtils.findUrlsInMarkdown(challenge.instruction),
      (challenge) => UrlUtils.findUrlsInMarkdown(challenge.proposals),
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
