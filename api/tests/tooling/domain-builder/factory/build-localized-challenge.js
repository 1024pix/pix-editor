import { LocalizedChallenge } from '../../../../lib/domain/models/index.js';

export function buildLocalizedChallenge({
  id = 'persistant id',
  challengeId = 'persistant id',
  embedUrl = 'https://example.com/embed.html',
  fileIds = [],
  locale = 'fr',
  status = null,
  geography = null,
}) {
  return new LocalizedChallenge({
    id,
    challengeId,
    embedUrl,
    fileIds,
    locale,
    status,
    geography,
  });
}
