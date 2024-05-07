import _ from 'lodash';

export async function validateUrlsFromRelease({ releaseRepository, urlErrorRepository, localizedChallengeRepository, UrlUtils }) {
  const release = await releaseRepository.getLatestRelease();

  await checkAndUploadKOUrlsFromChallenges(release, { urlErrorRepository, localizedChallengeRepository, UrlUtils });
  await checkAndUploadKOUrlsFromTutorials(release, { urlErrorRepository, UrlUtils });
}

function findUrlsFromChallenges(challenges, release, localizedChallengesById, UrlUtils) {
  return challenges.flatMap((challenge) => {
    const functions = [
      (challenge) => UrlUtils.findUrlsInMarkdown(challenge.instruction),
      (challenge) => UrlUtils.findUrlsInMarkdown(challenge.proposals),
      (challenge) => UrlUtils.findUrlsInMarkdown(challenge.solution),
      (challenge) => UrlUtils.findUrlsInMarkdown(challenge.solutionToDisplay),
      (challenge) => localizedChallengesById[challenge.id].urlsToConsult ?? [],
    ];
    const urls = functions
      .flatMap((fun) => fun(challenge))
      .map((url) => {
        return {
          id: [
            release.findOriginForChallenge(challenge) ?? '',
            release.findCompetenceNameForChallenge(challenge) ?? '',
            release.findSkillNameForChallenge(challenge) ?? '',
            challenge.id,
            challenge.status,
            challenge.locales[0]
          ].join(';'),
          url };
      });
    return _.uniqBy(urls, 'url');
  });
}

function findUrlsFromTutorials(tutorials, release) {
  return tutorials.map((tutorial) => {
    return {
      id: [
        release.findCompetenceNamesForTutorial(tutorial).join(' '),
        release.findSkillNamesForTutorial(tutorial).join(' '),
        tutorial.id
      ].join(';'),
      url: tutorial.link,
    };
  });
}

function keepAndFormatKOUrls(analyzedLines) {
  return analyzedLines.filter((line) => {
    return line.status === 'KO';
  }).map((line) => {
    return [...line.id.split(';'), line.url, line.status, line.error, line.comments];
  });
}

async function checkAndUploadKOUrlsFromChallenges(release, { urlErrorRepository, localizedChallengeRepository, UrlUtils }) {
  const operativeChallenges = release.operativeChallenges;
  const localizedChallengesById = _.keyBy(await localizedChallengeRepository.list(), 'id');
  const urlList = findUrlsFromChallenges(operativeChallenges, release, localizedChallengesById, UrlUtils);
  const analyzedUrls = await UrlUtils.analyzeIdentifiedUrls(urlList);
  const formattedKOChallengeUrls = keepAndFormatKOUrls(analyzedUrls);
  await urlErrorRepository.updateChallenges(formattedKOChallengeUrls);
}

async function checkAndUploadKOUrlsFromTutorials(release, { urlErrorRepository, UrlUtils }) {
  const tutorials = release.content.tutorials;
  const urlList = findUrlsFromTutorials(tutorials, release);
  const analyzedUrls = await UrlUtils.analyzeIdentifiedUrls(urlList);
  const formattedKOTutorialUrls = keepAndFormatKOUrls(analyzedUrls);
  await urlErrorRepository.updateTutorials(formattedKOTutorialUrls);
}
