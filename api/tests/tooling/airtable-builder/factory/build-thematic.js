module.exports = function buildThematic(
  {
    id,
    name,
    nameEnUs,
    competenceId,
    tubeIds,
    index,
  } = {}) {
  return {
    id,
    'fields': {
      'Nom': name,
      'Titre en-us': nameEnUs,
      'Competence (id persistant)': [competenceId],
      'Tubes (id persistant)': tubeIds,
      'Index': index
    },
  };
};
