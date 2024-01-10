import { LocalizedChallenge } from '../../../../lib/domain/models';

export function buildLocalizedChallenge({
  id = 'persistant id',
  challengeId = 'persistant id',
  locale = 'fr',
  embedUrl = 'https://example.com/embed.html',
  status = null,
}) {
  return new LocalizedChallenge({
    id,
    challengeId,
    locale,
    embedUrl,
    status
  });
}
