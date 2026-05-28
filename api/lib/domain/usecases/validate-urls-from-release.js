import _ from 'lodash';
import { writeFile } from 'node:fs/promises';

export async function validateUrlsFromRelease({
  releaseRepository,
  urlRepository,
  localizedChallengeRepository,
  whitelistedUrlRepository,
  UrlUtils,
}) {
  const release = await releaseRepository.getLatestRelease();
  const whitelistedUrls = await whitelistedUrlRepository.list();
  const activeWhitelistedUrls = whitelistedUrls.filter((whitelistedUrl) => whitelistedUrl.isActive);

  await checkAndUploadKOUrlsFromChallenges(
    release,
    { urlRepository, localizedChallengeRepository, UrlUtils },
    activeWhitelistedUrls,
  );
  await checkAndUploadKOUrlsFromTutorials(release, { urlRepository, UrlUtils }, activeWhitelistedUrls);
}

function findUrlsFromChallenges(challenges, release, localizedChallengesById, UrlUtils) {
  return challenges.flatMap((challenge) => {
    const functions = [
      (challenge) => UrlUtils.findUrlsInMarkdown(challenge.instruction),
      (challenge) => UrlUtils.findUrlsInMarkdown(challenge.proposals),
      (challenge) => UrlUtils.findUrlsInText(challenge.solution),
      (challenge) => UrlUtils.findUrlsInText(challenge.solutionToDisplay),
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
            challenge.locales[0],
          ].join(';'),
          url,
        };
      });
    return _.uniqBy(urls, 'url');
  });
}

function findUrlsFromTutorials(release, UrlUtils) {
  const notObsoleteSkills = release.content.skills.filter((skill) => !skill.isPerime);
  const accessibleTutorialIds = new Set(
    notObsoleteSkills.flatMap((skill) => [...skill.tutorialIds, ...skill.learningMoreTutorialIds]),
  );
  return release.content.tutorials
    .filter((tutorial) => accessibleTutorialIds.has(tutorial.id))
    .map((tutorial) => {
      const skills = notObsoleteSkills.filter((skill) => skill.tutorialIds.includes(tutorial.id) || skill.learningMoreTutorialIds.includes(tutorial.id));
      const competenceIds = new Set(skills.flatMap((skill) => skill.competenceId));
      const competences = release.content.competences.filter((competence) => competenceIds.has(competence.id));
      return {
        id: [
          competences.map((competence) => competence.name_i18n.fr).join(' '),
          skills.map((skill) => skill.name).join(' '),
          tutorial.id,
        ].join(';'),
        url: UrlUtils.findUrlsInText(tutorial.link)[0],
      };
    });
}

function keepAndFormatKOUrls(analyzedLines) {
  return analyzedLines
    .filter((line) => {
      return line.status === 'KO';
    })
    .map((line) => {
      return [
        ...line.id.split(';'),
        line.url,
        line.status,
        line.error,
        line.comments,
      ];
    });
}

async function checkAndUploadKOUrlsFromChallenges(
  release,
  { localizedChallengeRepository, UrlUtils },
  whitelistedUrls,
) {
  const operativeChallenges = release.operativeChallenges;
  const localizedChallengesById = _.keyBy(await localizedChallengeRepository.list(), 'id');
  const urlList = findUrlsFromChallenges(operativeChallenges, release, localizedChallengesById, UrlUtils);
  const finalUrlList = urlList.filter(
    ({ url }) => !whitelistedUrls.some((whitelistedUrl) => whitelistedUrl.matches(url)),
  );
  console.log('ok cool', finalUrlList.length);
  await saveUrlListOnTempFile(finalUrlList.map(({ url }) => url), 'challenges');
  // const analyzedUrls = await UrlUtils.analyzeIdentifiedUrls(finalUrlList);
  // const formattedKOChallengeUrls = keepAndFormatKOUrls(analyzedUrls);
  // await urlRepository.updateChallenges(formattedKOChallengeUrls);
}

async function checkAndUploadKOUrlsFromTutorials(release, { UrlUtils }, whitelistedUrls) {
  const urlList = findUrlsFromTutorials(release, UrlUtils);
  const finalUrlList = urlList.filter(
    ({ url }) => !whitelistedUrls.some((whitelistedUrl) => whitelistedUrl.matches(url)),
  );
  // const analyzedUrls = await UrlUtils.analyzeIdentifiedUrls(finalUrlList);
  // const formattedKOTutorialUrls = keepAndFormatKOUrls(analyzedUrls);
  // await urlRepository.updateTutorials(formattedKOTutorialUrls);
}

async function saveUrlListOnTempFile(urlList, name) {
  await writeFile(`/tmp/external_urls_in_${name}.json`, JSON.stringify(urlList, null, 2));
}
