import { LocalizedChallenge } from '../../../../lib/domain/models';

export function buildLocalizedChallenge({
  id = 'persistant id',
  challengeId = 'persistant id',
  locale = 'fr',
}) {
  return new LocalizedChallenge({
    id,
    challengeId,
    locale,
  });
}
