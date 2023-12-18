import { LocalizedChallenge } from '../../../../lib/domain/models';

export function buildLocalizedChallenge({
  id = 'persistant id',
  challengeId = 'persistant id',
  locale = 'fr',
  embedUrl = 'https://site.com/embed.html',
}) {
  return new LocalizedChallenge({
    id,
    challengeId,
    locale,
    embedUrl,
  });
}
