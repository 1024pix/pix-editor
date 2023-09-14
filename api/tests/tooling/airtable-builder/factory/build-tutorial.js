export function buildTutorial({
  id,
  title,
  format,
  duration,
  source,
  link,
  locale,
  tutorialForSkills,
  furtherInformation,
} = {}) {

  return {
    id,
    'fields': {
      'id persistant': id,
      'Titre': title,
      'Format': format,
      'Durée': duration,
      'Source': source,
      'Lien': link,
      'Langue': locale,
      'Solution à': tutorialForSkills,
      'En savoir plus': furtherInformation,
    },
  };
}
