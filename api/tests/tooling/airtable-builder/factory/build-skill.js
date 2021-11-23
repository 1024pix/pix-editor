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
  description,
  level,
  internationalisation,
  version,
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
      'Description': description,
      'Level': level,
      'Internationalisation': internationalisation,
      'Version': version,
    },
  };
};

module.exports = buildSkill;
