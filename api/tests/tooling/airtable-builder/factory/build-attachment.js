const buildAttachment = function buildAttachment({
  id,
  alt,
  type,
  url,
  challengeId,
}) {

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
};

module.exports = buildAttachment;

