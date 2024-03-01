import { databaseBuffer } from '../database-buffer.js';

export function buildLocalizedChallenge({
  id = 'i18nChallenge123',
  challengeId = 'challenge123',
  locale = 'fr',
  embedUrl,
  status = null,
  geography = null,
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'localized_challenges',
    values: { id, challengeId, locale, embedUrl, status, geography },
  });
}
