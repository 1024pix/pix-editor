import { LocalizedChallenge } from '../../../../lib/domain/models/index.js';

export function buildLocalizedChallenge({
  id = 'persistant id',
  challengeId = 'persistant id',
  embedUrl = 'https://example.com/embed.html',
  primaryEmbedUrl = 'https://example.com/embed.html',
  fileIds = [],
  locale = 'fr',
  status = null,
  geography = null,
  urlsToConsult = ['http://url.com'],
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
  });
}
