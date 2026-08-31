import _ from 'lodash';
import { DomainTransaction } from '../DomainTransaction.js';

const DOMAIN_NAMES_TO_EXCLUDE = [
  'wikipedia.org',
  'google.com',
  'google.fr',
  'pix.fr',
  'pix.org',
];

export async function saveUrlsFromRelease({
  brokenUrlRepository,
  releaseRepository,
  urlRepository,
  localizedChallengeRepository,
  whitelistedUrlRepository,
  UrlUtils,
  domainNamesToExclude = DOMAIN_NAMES_TO_EXCLUDE,
}) {
  const release = await releaseRepository.getLatestRelease();
  const whitelistedUrls = await whitelistedUrlRepository.list();
  const activeWhitelistedUrls = whitelistedUrls.filter((whitelistedUrl) => whitelistedUrl.isActive);

  return DomainTransaction.execute(async () => {
    await saveChallengeUrls(
      release,
      activeWhitelistedUrls,
      domainNamesToExclude,
      { urlRepository, localizedChallengeRepository, UrlUtils },
    );
    await saveTutorialUrls(release, activeWhitelistedUrls, domainNamesToExclude, { urlRepository, UrlUtils });
    await brokenUrlRepository.deleteUnmentionedBrokenUrls();
  });
}

function findUrlsFromChallenges(challenges, release, localizedChallengesById, UrlUtils) {
  const challengeUrlsLocation = challenges.flatMap((challenge) => {
    const functions = [
      (challenge) => UrlUtils.findUrlsInMarkdown(challenge.instruction),
      (challenge) => UrlUtils.findUrlsInMarkdown(challenge.proposals),
      (challenge) => UrlUtils.findUrlsInText(challenge.solution),
      (challenge) => UrlUtils.findUrlsInText(challenge.solutionToDisplay),
      (challenge) => localizedChallengesById[challenge.id].urlsToConsult ?? [],
    ];
    return functions
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
  });

  const urlsLocationByUrl = _.groupBy(challengeUrlsLocation, 'url');
  return Object
    .entries(urlsLocationByUrl)
    .map(([url, values]) => {
      return {
        framework_name: deduplicateByField(values, 'framework_name').join(', '),
        competence_name: deduplicateByField(values, 'competence_name').join(', '),
        skill_name: deduplicateByField(values, 'skill_name').join(', '),
        challenge_id: deduplicateByField(values, 'challenge_id').join(', '),
        locale: deduplicateByField(values, 'locale').join(', '),
        challenge_status: deduplicateByField(values, 'challenge_status').join(', '),
        url,
      };
    });
}

function findUrlsFromTutorials(release, UrlUtils) {
  const notObsoleteSkills = release.content.skills.filter((skill) => !skill.isPerime);
  const accessibleTutorialIds = new Set(
    notObsoleteSkills.flatMap((skill) => [...skill.tutorialIds, ...skill.learningMoreTutorialIds]),
  );
  const urlsLocation = release.content.tutorials
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

  const urlsLocationByUrl = _.groupBy(urlsLocation, 'url');
  return Object
    .entries(urlsLocationByUrl)
    .map(([url, values]) => {
      return {
        competence_name: deduplicateByField(values, 'competence_name').join(', '),
        skill_name: deduplicateByField(values, 'skill_name').join(', '),
        tutorial_id: deduplicateByField(values, 'tutorial_id').join(', '),
        url,
      };
    });
}

function deduplicateByField(objects, fieldName) {
  return [...new Set(objects.map((object) => object[fieldName]))];
}

export async function saveChallengeUrls(
  release,
  whitelistedUrls,
  domainNamesToExclude,
  { urlRepository, localizedChallengeRepository, UrlUtils },
) {
  const operativeChallenges = release.operativeChallenges;
  const localizedChallengesById = _.keyBy(await localizedChallengeRepository.list(), 'id');
  const urlList = findUrlsFromChallenges(operativeChallenges, release, localizedChallengesById, UrlUtils);
  const finalUrlList = urlList
    .filter(isUrlNotInWhitelist(whitelistedUrls))
    .filter(isUrlNotADomainToExclude(domainNamesToExclude));
  await urlRepository.updateChallenges(finalUrlList);
}

export async function saveTutorialUrls(release, whitelistedUrls, domainNamesToExclude, { urlRepository, UrlUtils }) {
  const urlList = findUrlsFromTutorials(release, UrlUtils);
  const finalUrlList = urlList
    .filter(isUrlNotInWhitelist(whitelistedUrls)) // supprime les urls qui sont whitelistée
    .filter(isUrlNotADomainToExclude(domainNamesToExclude));
  await urlRepository.updateTutorials(finalUrlList);
}

/**
 * Check if url is whitelist
 * if in whitelist : should be ignored
 * @param whitelistedUrls
 */
function isUrlNotInWhitelist(whitelistedUrls) {
  return ({ url }) => !whitelistedUrls.some((whitelistedUrl) => whitelistedUrl.matches(url));
}

/**
 * Check if url is in excluded domain
 * if in excluded domain : should be ignored
 * @param domainNamesToExclude
 */
function isUrlNotADomainToExclude(domainNamesToExclude) {
  const regexList = domainNamesToExclude.map((domainName) => new RegExp(`(https://)?.*.${domainName}`, 'gi'));
  return ({ url }) => !regexList.some((regex) => regex.test(url));
}
