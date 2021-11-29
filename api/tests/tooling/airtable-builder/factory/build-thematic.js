module.exports = function buildThematic(
  {
    id,
    name,
    competenceId,
    tubeIds,
    index,
  } = {}) {
  return {
    id,
    'fields': {
      'Nom': name,
      'Competence (id persistant)': [competenceId],
      'Tubes (id persistant)': tubeIds,
      'Index': index
    },
  };
};
