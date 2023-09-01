export function buildAttachment({
  id = 'attid1',
  alt = 'alt',
  type = 'image/png',
  url = 'url/to/attachment',
  challengeId = 'challid1',
} = {}) {

  return {
    id,
    'fields': {
      'Record ID': id,
      'alt': alt,
      'url': url,
      'challengeId persistant': [challengeId],
      'type': type,
    },
  };
}
