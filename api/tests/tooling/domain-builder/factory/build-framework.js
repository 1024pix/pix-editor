const Framework = require('../../../../lib/domain/models/Framework');

module.exports = function buildFramework(
  {
    id = 'recFvllz2Ckz',
    name = 'Nom du referentiel'
  } = {}) {
  return new Framework({
    id,
    name
  });
};
