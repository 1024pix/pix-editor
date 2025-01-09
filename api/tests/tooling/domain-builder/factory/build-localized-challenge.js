import { LocalizedChallenge } from '../../../../lib/domain/models/index.js';
import { LocalizedChallenge as LocalizedChallengeRead } from '../../../../lib/domain/readmodels/index.js';

export function buildLocalizedChallengeRead({
  id = 'persistant id',
  challengeId = 'persistant id',
  locale = 'fr',
  instruction = 'une instruction par défaut',
  status = LocalizedChallenge.STATUSES.PRIMARY,
}) {
  return new LocalizedChallengeRead({
    id,
    challengeId,
    locale,
    instruction,
    status,
  });
}

export function buildLocalizedChallenge({
  id = 'persistant id',
  challengeId = 'persistant id',
  embedUrl = 'https://example.com/embed.html',
  primaryEmbedUrl = 'https://example.com/embed.html',
  fileIds = [],
  locale = 'fr',
  status = LocalizedChallenge.STATUSES.PRIMARY,
  geography = null,
  urlsToConsult = ['http://url.com'],
  requireGafamWebsiteAccess = false,
  isIncompatibleIpadCertif = false,
  deafAndHardOfHearing = LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.RAS,
  isAwarenessChallenge = false,
  toRephrase = false,
}) {
  return new LocalizedChallenge({
    id,
    challengeId,
    embedUrl,
    primaryEmbedUrl,
    fileIds,
    locale,
    status,
    geography,
    urlsToConsult,
    requireGafamWebsiteAccess,
    isIncompatibleIpadCertif,
    deafAndHardOfHearing,
    isAwarenessChallenge,
    toRephrase,
  });
}
