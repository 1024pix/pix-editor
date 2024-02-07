export function buildAttachment({
  id = 'attachmentId',
  url = 'http://',
  alt = 'alt text',
  type = 'image',
  challengeId = 'recChallengeId',
  localizedChallengeId = challengeId,
} = {}) {

  return {
    id,
    'fields': {
      'Record ID': id,
      'alt': alt,
      'url': url,
      'challengeId persistant': [challengeId],
      'type': type,
      localizedChallengeId
    },
  };
}
