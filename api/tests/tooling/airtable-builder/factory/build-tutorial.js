module.exports = function buildTutorial({
  id,
  title,
  format,
  duration,
  source,
  link,
  locale,
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
    },
  };
};
