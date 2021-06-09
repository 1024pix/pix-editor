module.exports = function buildCompetence({
  id,
  index,
  name,
  nameFrFr,
  nameEnUs,
  description,
  descriptionFrFr,
  descriptionEnUs,
  areaId,
  skillIds,
  origin,
}) {
  return {
    id,
    'fields': {
      'id persistant': id,
      'Sous-domaine': index,
      'Domaine (id persistant)': [areaId],
      'Titre': name,
      'Titre fr-fr': nameFrFr,
      'Titre en-us': nameEnUs,
      'Acquis (via Tubes) (id persistant)': skillIds,
      'Origine2': [origin],
      'Description': description,
      'Description fr-fr': descriptionFrFr,
      'Description en-us': descriptionEnUs,
    },
  };
};
