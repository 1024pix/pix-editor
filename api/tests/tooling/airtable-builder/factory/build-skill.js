const buildSkill = function buildSkill({
  id,
  name,
  hintFrFr,
  hintEnUs,
  hintStatus,
  tutorialIds,
  learningMoreTutorialIds,
  pixValue,
  competenceId,
  status,
  tubeId,
} = {}) {

  return {
    id,
    'fields': {
      'id persistant': id,
      'Indice fr-fr': hintFrFr,
      'Indice en-us': hintEnUs,
      'Statut de l\'indice': hintStatus,
      'Comprendre (id persistant)': tutorialIds,
      'En savoir plus (id persistant)': learningMoreTutorialIds,
      'Tube (id persistant)': [tubeId],
      'Status': status,
      'Nom': name,
      'Compétence (via Tube) (id persistant)': [competenceId],
      'PixValue': pixValue,
    },
  };
};

module.exports = buildSkill;
