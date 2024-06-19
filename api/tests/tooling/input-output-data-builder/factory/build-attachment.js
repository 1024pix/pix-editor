export function buildAttachment({
  id = 'attachmentId',
  url = 'http://',
  type = 'image',
  size = 123,
  mimeType = 'image/jpeg',
  filename = 'nom_fichier',
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
      size,
      mimeType,
      filename,
      localizedChallengeId
    },
  };
}
