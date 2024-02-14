export function buildAttachment({
  id = 'attid1',
  type = 'illustration',
  url = 'url/to/attachment',
  challengeId = 'challid1',
  createdAt = new Date().toISOString(),
  localizedChallengeId = challengeId,
} = {}) {

  return {
    id,
    'fields': {
      'Record ID': id,
      'challengeId persistant': [challengeId],
      createdAt,
      localizedChallengeId,
      type,
      url,
    },
  };
}
