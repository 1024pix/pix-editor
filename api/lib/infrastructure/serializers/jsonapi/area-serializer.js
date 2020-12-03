const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(areas) {
    return new Serializer('area', {
      transform(current) {
        const area = Object.assign({}, current);
        area.competences = area.competenceAirtableIds.map((competenceId) => ({ id: competenceId }));
        return area;
      },
      attributes: ['code', 'name', 'competences'],
      competences: {
        ref: 'id',
      }
    }).serialize(areas);
  }
};
