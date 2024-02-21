import { Attachment } from '../../../../lib/domain/models/Attachment';

export function buildAttachment({
  id = 'attachmentId',
  url = 'http://',
  type = 'image',
  challengeId = 'recChallengeId',
  localizedChallengeId = challengeId,
} = {}) {

  return new Attachment({
    id,
    url,
    type,
    challengeId,
    localizedChallengeId,
  });
}
