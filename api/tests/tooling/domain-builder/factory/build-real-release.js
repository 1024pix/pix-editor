const Release = require('../../../../lib/domain/models/Release');

module.exports = function buildRelease({
  id = 123,
  content = { id: 'content' },
  createdAt = new Date('2020-01-01'),
} = {}) {
  return new Release({
    id,
    content,
    createdAt,
  });
};
