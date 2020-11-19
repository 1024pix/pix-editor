const _ = require('lodash');
const datasource = require('./datasource');

module.exports = datasource.extend({

  modelName: 'Skill',

  tableName: 'Acquis',

  usedFields: [
    'id persistant',
    'Nom',
    'Indice',
    'Indice fr-fr',
    'Indice en-us',
    'Statut de l\'indice',
    'Comprendre (id persistant)',
    'En savoir plus (id persistant)',
    'PixValue',
    'Compétence (via Tube) (id persistant)',
    'Status',
    'Tube (id persistant)',
  ],

  fromAirTableObject(airtableRecord) {

    return {
      id: airtableRecord.get('id persistant'),
      name: airtableRecord.get('Nom'),
      hintFrFr: airtableRecord.get('Indice fr-fr'),
      hintEnUs: airtableRecord.get('Indice en-us'),
      hintStatus: airtableRecord.get('Statut de l\'indice') || 'no status',
      tutorialIds: airtableRecord.get('Comprendre (id persistant)') || [],
      learningMoreTutorialIds: airtableRecord.get('En savoir plus (id persistant)') || [],
      pixValue: airtableRecord.get('PixValue'),
      competenceId: _.head(airtableRecord.get('Compétence (via Tube) (id persistant)')),
      status: airtableRecord.get('Status'),
      tubeId: _.head(airtableRecord.get('Tube (id persistant)')),
    };
  },
});
