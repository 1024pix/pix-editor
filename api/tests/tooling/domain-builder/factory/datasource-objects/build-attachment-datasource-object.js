export function buildAttachmentDatasourceObject({
  id = 'attachmentId',
  url = 'http://',
  alt = 'alt text',
  type = 'image',
  challengeId = 'recChallengeId',
  localizedChallengeId = challengeId,
} = {}) {

  return {
    id,
    url,
    alt,
    type,
    challengeId,
    localizedChallengeId,
  };
}
