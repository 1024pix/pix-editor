const buildArea = function buildArea({
  id,
  competenceIds,
  competenceAirtableIds,
  titleFrFr,
  titleEnUs,
  code,
  name,
  color,
} = {}) {
  return {
    id,
    'fields': {
      'id persistant': id,
      'Competences (identifiants) (id persistant)': competenceIds,
      'Competences (identifiants)': competenceAirtableIds,
      'Titre fr-fr': titleFrFr,
      'Titre en-us': titleEnUs,
      'Code': code,
      'Nom': name,
      'Couleur': color
    },
  };
};

module.exports = buildArea;
