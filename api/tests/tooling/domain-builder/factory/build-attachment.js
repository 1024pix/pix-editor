import { Attachment } from '../../../../lib/domain/models/index.js';

export function buildAttachment({
  id = 'attachmentId',
  url = 'http://',
  type = 'image',
  alt = 'alt text',
  size = 123,
  mimeType = 'image/jpeg',
  filename = 'mon_image',
  challengeId = 'recChallengeId',
  localizedChallengeId = challengeId,
} = {}) {

  return new Attachment({
    id,
    url,
    type,
    alt,
    size,
    mimeType,
    filename,
    challengeId,
    localizedChallengeId,
  });
}
