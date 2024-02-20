import { Attachment } from '../../../../lib/domain/models/Attachment';

export function buildAttachment({
  id = 'attachmentId',
  url = 'http://',
  alt = 'alt text',
  type = 'image',
  challengeId = 'recChallengeId',
  localizedChallengeId = challengeId,
} = {}) {

  return new Attachment({
    id,
    url,
    alt,
    type,
    challengeId,
    localizedChallengeId,
  });
}
