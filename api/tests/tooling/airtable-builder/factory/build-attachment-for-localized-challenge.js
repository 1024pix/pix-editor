export function buildAttachmentForLocalizedChallenge({
  id = 'attid1',
  alt = 'alt',
  type = 'image/png',
  url = 'url/to/attachment',
  localizedChallengeId = 'localizedChallengeId',
} = {}) {

  return {
    id,
    'fields': {
      'Record ID': id,
      'alt': alt,
      'url': url,
      'type': type,
      localizedChallengeId
    },
  };
}
