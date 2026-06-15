import { databaseBuffer } from '../database-buffer.js';

/**
 * @param {{
 *   id?: string
 *   challengeId?: string
 *   locale?: string
 *   embedUrl?: string
 *   status?: string
 *   geography?: string
 *   urlsToConsult?: string[]
 *   requireGafamWebsiteAccess?: boolean
 *   isIncompatibleIpadCertif?: boolean
 *   isAwarenessChallenge?: boolean
 *   toRephrase?: boolean
 *   deafAndHardOfHearing?: string
 *   hasEmbedInternalValidation?: boolean
 *   noValidationNeeded?: boolean
 *   validatedAt?: string | number | Date
 *   createdAt?: string | number | Date
 *   updatedAt?: string | number | Date
 * }} localizedChallengeToBuild
 */
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
  validatedAt = null,
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
      validatedAt,
    },
  });
}
