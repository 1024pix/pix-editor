export function buildAttachmentDatasourceObject({
  id = 'attachmentId',
  url = 'http://',
  type = 'image',
  challengeId = 'recChallengeId',
  airtableChallengeId = challengeId,
  localizedChallengeId = challengeId,
  filename = 'file.ext',
  mimeType = 'image/ext',
  size = 123,
} = {}) {
  return {
    id,
    url,
    type,
    challengeId,
    airtableChallengeId,
    localizedChallengeId,
    filename,
    mimeType,
    size,
  };
}
