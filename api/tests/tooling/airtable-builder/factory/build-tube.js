module.exports = function buildTube({
  id,
  name,
  title,
  description,
  practicalTitleFrFr,
  practicalTitleEnUs,
  practicalDescriptionFrFr,
  practicalDescriptionEnUs,
  competenceId,
} = {}) {

  return {
    id,
    'fields': {
      'id persistant': id,
      'Nom': name,
      'Titre': title,
      'Description': description,
      'Titre pratique fr-fr': practicalTitleFrFr,
      'Titre pratique en-us': practicalTitleEnUs,
      'Description pratique fr-fr': practicalDescriptionFrFr,
      'Description pratique en-us': practicalDescriptionEnUs,
      'Competences (id persistant)': [competenceId],
    },
  };
};
