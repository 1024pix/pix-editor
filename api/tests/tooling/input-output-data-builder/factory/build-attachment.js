export function buildAttachment({
  id = 'attachmentId',
  url = 'http://',
  type = 'image',
  challengeId = 'recChallengeId',
  localizedChallengeId = challengeId,
} = {}) {

  return {
    id,
    'fields': {
      'Record ID': id,
      'url': url,
      'challengeId persistant': [challengeId],
      'type': type,
      localizedChallengeId
    },
  };
}
