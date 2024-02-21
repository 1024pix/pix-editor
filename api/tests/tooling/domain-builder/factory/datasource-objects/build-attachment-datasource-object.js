export function buildAttachmentDatasourceObject({
  id = 'attachmentId',
  url = 'http://',
  type = 'image',
  challengeId = 'recChallengeId',
  localizedChallengeId = challengeId,
} = {}) {

  return {
    id,
    url,
    type,
    challengeId,
    localizedChallengeId,
  };
}
