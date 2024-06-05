import { Attachment } from '../../../../lib/domain/models/index.js';

export function buildAttachment({
  id = 'attachmentId',
  url = 'http://',
  type = 'image',
  alt = 'alt text',
  challengeId = 'recChallengeId',
  localizedChallengeId = challengeId,
} = {}) {

  return new Attachment({
    id,
    url,
    type,
    alt,
    challengeId,
    localizedChallengeId,
  });
}
