const Release = require('../../../../lib/domain/models/release/Release');
const buildContentForRelease = require('./build-content-for-release');

module.exports = function buildRelease({
  id = 123,
  content = buildContentForRelease(),
  createdAt = new Date('2020-01-01'),
} = {}) {
  return new Release({
    id,
    content,
    createdAt,
  });
};
