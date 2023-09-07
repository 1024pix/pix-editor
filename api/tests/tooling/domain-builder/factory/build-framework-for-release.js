const FrameworkForRelease = require('../../../../lib/domain/models/release/FrameworkForRelease');

module.exports = function buildFrameworkForRelease(
  {
    id = 'recFvllz2Ckz',
    name = 'Nom du referentiel'
  } = {}) {
  return new FrameworkForRelease({
    id,
    name
  });
};
