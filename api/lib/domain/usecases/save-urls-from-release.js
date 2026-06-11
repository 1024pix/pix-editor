import _ from 'lodash';
import { knex } from '../../../db/knex-database-connection.js';

export async function saveUrlsFromRelease({
  releaseRepository,
  urlRepository,
  localizedChallengeRepository,
  whitelistedUrlRepository,
  UrlUtils,
}) {
  const release = await releaseRepository.getLatestRelease();
  const whitelistedUrls = await whitelistedUrlRepository.list();
  const activeWhitelistedUrls = whitelistedUrls.filter((whitelistedUrl) => whitelistedUrl.isActive);

  return knex.transaction(async (transaction) => {
    await saveChallengeUrls(
      release,
      activeWhitelistedUrls,
      transaction,
      { urlRepository, localizedChallengeRepository, UrlUtils },
    );
    await saveTutorialUrls(release, activeWhitelistedUrls, transaction, { urlRepository, UrlUtils });
  });
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
      .map((url) => ({
        framework_name: release.findOriginForChallenge(challenge) ?? '',
        competence_name: release.findCompetenceNameForChallenge(challenge) ?? '',
        skill_name: release.findSkillNameForChallenge(challenge) ?? '',
        challenge_id: challenge.id,
        challenge_status: challenge.status,
        locale: challenge.locales[0],
        url,
      }));
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
    .flatMap((tutorial) => {
      const skills = notObsoleteSkills.filter((skill) => skill.tutorialIds.includes(tutorial.id) || skill.learningMoreTutorialIds.includes(tutorial.id));

      return skills.map((skill) => ({
        skill_name: skill.name,
        competence_name: release.content.competences.find((competence) => competence.id === skill.competenceId).name_i18n.fr,
        tutorial_id: tutorial.id,
        url: UrlUtils.findUrlsInText(tutorial.link)[0],
      }));
    });
}

export async function saveChallengeUrls(
  release,
  whitelistedUrls,
  transaction,
  { urlRepository, localizedChallengeRepository, UrlUtils },
) {
  const operativeChallenges = release.operativeChallenges;
  const localizedChallengesById = _.keyBy(await localizedChallengeRepository.list(), 'id');
  const urlList = findUrlsFromChallenges(operativeChallenges, release, localizedChallengesById, UrlUtils);
  const finalUrlList = urlList.filter(
    ({ url }) => !whitelistedUrls.some((whitelistedUrl) => whitelistedUrl.matches(url)),
  );
  await urlRepository.updateChallenges(finalUrlList, transaction);
}

export async function saveTutorialUrls(release, whitelistedUrls, transaction, { urlRepository, UrlUtils }) {
  const urlList = findUrlsFromTutorials(release, UrlUtils);
  const finalUrlList = urlList.filter(
    ({ url }) => !whitelistedUrls.some((whitelistedUrl) => whitelistedUrl.matches(url)),
  );
  await urlRepository.updateTutorials(finalUrlList, transaction);
}
