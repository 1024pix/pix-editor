module.exports = function buildAttachment({
  id = 'attachmentId',
  url = 'http://',
  alt = 'alt text',
  type = 'image',
  challengeId = 'recChallengeId',
} = {}) {

  return {
    id,
    url,
    alt,
    type,
    challengeId,
  };
};
