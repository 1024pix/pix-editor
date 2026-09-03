import { databaseBuffer } from '../database-buffer.js';

export function buildExternalUrl({
  id = databaseBuffer.getNextId(),
  url = 'https://knexjs.org',
  localizedChallengeIds = ['recMonChallenge'],
  tutorialIds = ['recMonTuto'],
} = {}) {
  const externalUrl = databaseBuffer.pushInsertable({
    tableName: 'external_urls',
    values: {
      id,
      url,
    },
  });
  localizedChallengeIds?.forEach((localizedChallengeId) => {
    databaseBuffer.pushInsertable({
      tableName: 'external_urls-localized_challenges',
      values: {
        externalUrlId: externalUrl.id,
        localizedChallengeId,
      },
    });
  });
  tutorialIds?.forEach((tutorialId) => {
    databaseBuffer.pushInsertable({
      tableName: 'external_urls-tutorials',
      values: {
        externalUrlId: externalUrl.id,
        tutorialId,
      },
    });
  });
  return externalUrl;
}
