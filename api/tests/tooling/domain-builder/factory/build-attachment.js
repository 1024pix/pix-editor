module.exports = function buildAttachment({
  id,
  url,
  alt,
  type,
  challengeId,
} = {}) {

  return {
    id,
    url,
    alt,
    type,
    challengeId,
  };
};
