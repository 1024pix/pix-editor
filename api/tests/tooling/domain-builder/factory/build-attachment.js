import { Attachment } from '../../../../lib/domain/models/index.js';

export function buildAttachment({
  id = 'attachmentId',
  url = 'http://',
  type = 'image',
  size = 123,
  mimeType = 'image/jpeg',
  filename = 'mon_image',
  challengeId = 'recChallengeId',
  airtableChallengeId = 'recAirtableChallengeId',
  localizedChallengeId = challengeId,
} = {}) {
  return new Attachment({
    id,
    url,
    type,
    size,
    mimeType,
    filename,
    challengeId,
    airtableChallengeId,
    localizedChallengeId,
  });
}
