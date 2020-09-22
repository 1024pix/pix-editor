const AirtableRecord = require('airtable').Record;

module.exports = function areaRawAirTableFixture() {
  return new AirtableRecord('Domaine', 'recvoGdo7z2z7pXWa', {
    'id': 'recvoGdo7z2z7pXWa',
    'fields': {
      'id persistant': 'recvoGdo7z2z7pXWa',
      'Competences (identifiants)': [
        'recsvLz0W2ShyfD63',
        'recNv8qhaY887jQb2',
        'recIkYm646lrGvLNT',
      ],
      'Code': '1',
      'Nom': '1. Information et données',
    },
  });
};
