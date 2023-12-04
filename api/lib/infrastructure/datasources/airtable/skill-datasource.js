import _ from 'lodash';
import { datasource } from './datasource.js';

export const skillDatasource = datasource.extend({

  modelName: 'Skill',

  tableName: 'Acquis',

  usedFields: [
    'id persistant',
    'Nom',
    'Statut de l\'indice',
    'Comprendre (id persistant)',
    'En savoir plus (id persistant)',
    'PixValue',
    'Compétence (via Tube) (id persistant)',
    'Status',
    'Tube (id persistant)',
    'Description',
    'Level',
    'Internationalisation',
    'Version',
  ],

  fromAirTableObject(airtableRecord) {

    return {
      id: airtableRecord.get('id persistant'),
      name: airtableRecord.get('Nom'),
      hintStatus: airtableRecord.get('Statut de l\'indice') || 'no status',
      tutorialIds: airtableRecord.get('Comprendre (id persistant)') || [],
      learningMoreTutorialIds: airtableRecord.get('En savoir plus (id persistant)') || [],
      pixValue: airtableRecord.get('PixValue'),
      competenceId: _.head(airtableRecord.get('Compétence (via Tube) (id persistant)')),
      status: airtableRecord.get('Status'),
      tubeId: _.head(airtableRecord.get('Tube (id persistant)')),
      description: airtableRecord.get('Description'),
      level: airtableRecord.get('Level'),
      internationalisation: airtableRecord.get('Internationalisation'),
      version: airtableRecord.get('Version')
    };
  },
});
