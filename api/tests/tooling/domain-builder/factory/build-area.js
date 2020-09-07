const Area = require('../../../../lib/domain/models/Area');

module.exports = function buildArea({
  id,
  code,
  name,
  competenceIds,
} = {}) {
  return new Area({
    id,
    name,
    code,
    competenceIds,
  });
};

