export function buildSkill({
  id,
  airtableId,
  name,
  hintStatus,
  tutorialIds,
  learningMoreTutorialIds,
  pixValue,
  competenceId,
  status = 'actif',
  tubeId,
  description,
  level,
  internationalisation,
  version,
} = {}) {

  return {
    id: airtableId,
    'fields': {
      'id persistant': id,
      'Record Id': airtableId,
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
}
