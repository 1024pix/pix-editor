const Area = require('../../../../lib/domain/models/Area');

module.exports = function buildArea({
  id,
  code,
  name,
  competenceIds,
  competenceAirtableIds,
} = {}) {
  return new Area({
    id,
    name,
    code,
    competenceIds,
    competenceAirtableIds,
  });
};

