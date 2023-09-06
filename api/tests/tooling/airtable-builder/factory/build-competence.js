module.exports = function buildCompetence({
  id = 'competenceid1',
  index,
  areaId,
  skillIds,
  thematicIds,
  origin,
} = {}) {
  return {
    id,
    'fields': {
      'id persistant': id,
      'Sous-domaine': index,
      'Domaine (id persistant)': [areaId],
      'Acquis (via Tubes) (id persistant)': skillIds,
      'Thematiques': thematicIds,
      'Origine2': [origin],
    },
  };
};
