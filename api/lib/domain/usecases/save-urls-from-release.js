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
  const localizedChallenges = await localizedChallengeRepository.list();
  const whitelistedUrls = await whitelistedUrlRepository.list();
  const activeWhitelistedUrls = whitelistedUrls.filter((whitelistedUrl) => whitelistedUrl.isActive);

  const urlsFromChallenges = getChallengeUrls(release, localizedChallenges, activeWhitelistedUrls, domainNamesToExclude, UrlUtils);
  const urlsFromTutorials = getTutorialUrls(release, activeWhitelistedUrls, domainNamesToExclude, UrlUtils);

  const externalUrls = mergeChallengeAndTutorialUrls(urlsFromChallenges, urlsFromTutorials);

  return DomainTransaction.execute(async () => {
    await urlRepository.batchResetAndInsert(externalUrls);
    await brokenUrlRepository.deleteUnmentionedBrokenUrls();
  });
}

function findUrlsFromChallenges(challenges, release, localizedChallengesById, UrlUtils) {
  const localizedChallengeUrls = challenges.flatMap((challenge) => {
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
        localizedChallengeId: challenge.id,
        url,
      }));
  });

  const urlsLocationByUrl = _.groupBy(localizedChallengeUrls, 'url');
  return Object
    .entries(urlsLocationByUrl)
    .map(([url, values]) => {
      return {
        localizedChallengeIds: deduplicateByField(values, 'localizedChallengeId'),
        url,
      };
    });
}

function findUrlsFromTutorials(release, UrlUtils) {
  const notObsoleteSkills = release.content.skills.filter((skill) => !skill.isPerime);
  const accessibleTutorialIds = new Set(
    notObsoleteSkills.flatMap((skill) => [...skill.tutorialIds, ...skill.learningMoreTutorialIds]),
  );
  const tutorialUrls = release.content.tutorials
    .filter((tutorial) => accessibleTutorialIds.has(tutorial.id))
    .map((tutorial) => ({
      tutorialId: tutorial.id,
      url: UrlUtils.findUrlsInText(tutorial.link)[0],
    }));

  const urlsLocationByUrl = _.groupBy(tutorialUrls, 'url');
  return Object
    .entries(urlsLocationByUrl)
    .map(([url, values]) => {
      return {
        tutorialIds: deduplicateByField(values, 'tutorialId'),
        url,
      };
    });
}

function deduplicateByField(objects, fieldName) {
  return [...new Set(objects.map((object) => object[fieldName]))];
}

export function getChallengeUrls(
  release,
  localizedChallenges,
  whitelistedUrls,
  domainNamesToExclude,
  UrlUtils,
) {
  const operativeChallenges = release.operativeChallenges;
  const localizedChallengesById = _.keyBy(localizedChallenges, 'id');
  const urlList = findUrlsFromChallenges(operativeChallenges, release, localizedChallengesById, UrlUtils);
  return urlList
    .filter(isUrlNotInWhitelist(whitelistedUrls))
    .filter(isUrlNotADomainToExclude(domainNamesToExclude));
}

export function getTutorialUrls(release, whitelistedUrls, domainNamesToExclude, UrlUtils) {
  const urlList = findUrlsFromTutorials(release, UrlUtils);
  return urlList
    .filter(isUrlNotInWhitelist(whitelistedUrls))
    .filter(isUrlNotADomainToExclude(domainNamesToExclude));
}

/**
 * @param {{ url: string, localizedChallengeIds: string[] }[]} urlsFromChallenges
 * @param {{ url: string, tutorialIds: string[] }[]} urlsFromTutorials
 * @returns {{ url: string, localizedChallengeIds: string[], tutorialIds: string[] }[]} externalUrls
 */
export function mergeChallengeAndTutorialUrls(urlsFromChallenges, urlsFromTutorials) {
  const idsByUrl = new Map();
  for (const urlFromChallenge of urlsFromChallenges) {
    idsByUrl.set(urlFromChallenge.url, { localizedChallengeIds: urlFromChallenge.localizedChallengeIds, tutorialIds: [] });
  }
  for (const urlFromTutorial of urlsFromTutorials) {
    const existingEntry = idsByUrl.get(urlFromTutorial.url);
    if (existingEntry) {
      idsByUrl.set(
        urlFromTutorial.url,
        {
          localizedChallengeIds: existingEntry.localizedChallengeIds,
          tutorialIds: urlFromTutorial.tutorialIds,
        },
      );
    } else {
      idsByUrl.set(urlFromTutorial.url, { tutorialIds: urlFromTutorial.tutorialIds, localizedChallengeIds: [] });
    }
  }
  return idsByUrl.entries().map(([url, ids]) => ({
    url,
    ...ids,
  })).toArray();
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
