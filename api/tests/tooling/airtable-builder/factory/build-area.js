const buildArea = function buildArea({
  id = 'recvoGdo7z2z7pXWa',
  competenceIds = [
    'recsvLz0W2ShyfD63',
    'recNv8qhaY887jQb2',
    'recIkYm646lrGvLNT',
  ],
  code = '1',
  nom = '1. Information et données',
} = {}) {
  return {
    id,
    'fields': {
      'id persistant': id,
      'Competences (identifiants)': competenceIds,
      'Code': code,
      'Nom': nom,
    },
  };
};

module.exports = buildArea;
