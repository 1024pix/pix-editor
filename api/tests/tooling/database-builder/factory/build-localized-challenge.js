import { databaseBuffer } from '../database-buffer.js';

export function buildLocalizedChallenge({
  id = 'i18nChallenge123',
  challengeId = 'challenge123',
  locale = 'fr',
  embedUrl,
  requireGafamWebsiteAccess = false,
  isIncompatibleIpadCertif = false,
  deafAndHardOfHearing = 'RAS',
  isAwarenessChallenge = false,
  toRephrase = false,
  status = null,
  geography = 'AA',
  urlsToConsult = null,
  hasEmbedInternalValidation = false,
  noValidationNeeded = false,
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'localized_challenges',
    values: {
      id,
      challengeId,
      locale,
      embedUrl,
      status,
      geography,
      urlsToConsult,
      requireGafamWebsiteAccess,
      isIncompatibleIpadCertif,
      deafAndHardOfHearing,
      isAwarenessChallenge,
      toRephrase,
      hasEmbedInternalValidation,
      noValidationNeeded,
    },
  });
}
