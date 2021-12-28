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
  thematicIds,
  origin,
  fullName,
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
      'Thematiques': thematicIds,
      'Origine2': [origin],
      'Description': description,
      'Description fr-fr': descriptionFrFr,
      'Description en-us': descriptionEnUs,
      'Référence': fullName,
    },
  };
};
