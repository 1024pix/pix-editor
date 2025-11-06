export function buildAttachmentDatasourceObject({
  id = 'attachmentId',
  url = 'http://',
  type = 'image',
  challengeId = 'recChallengeId',
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
    airtableChallengeId: challengeId,
    localizedChallengeId,
    filename,
    mimeType,
    size,
  };
}
