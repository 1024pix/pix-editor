import _ from 'lodash';
import { datasource } from './datasource.js';
import { findRecords } from '../../airtable.js';

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

  /* Attributes to not write while in Airtable because they are formulas or lookups
    Nom
    Tube (id persistant)                        (write "Tube" instead)
    Comprendre (id persistant)                  (write "Comprendre" instead)
    En savoir plus (id persistant)              (write "En savoir plus" instead)
    PixValue
   */
  toAirTableObject(model) {
    return {
      fields: {
        'id persistant': model.id,
        'Statut de l\'indice': model.hintStatus,
        'Comprendre': model.tutorialIds,
        'En savoir plus': model.learningMoreTutorialIds,
        'Status': model.status,
        'Tube': [model.tubeId],
        'Description': model.description,
        'Level': model.level,
        'Internationalisation': model.internationalisation,
        'Version': model.version,
      }
    };
  },

  async filterByTubeId(tubeId) {
    const airtableRawObjects = await findRecords(this.tableName, {
      filterByFormula: `FIND("${tubeId}", ARRAYJOIN({Tube (id persistant)}))`,
    });
    if (airtableRawObjects.length === 0) return undefined;
    return airtableRawObjects.map(this.fromAirTableObject);
  },

  async getAirtableIdsByIds(skillIds) {
    const airtableRawObjects = await findRecords(this.tableName, {
      fields: ['Record Id', 'id persistant'],
      filterByFormula: `OR(${skillIds.map((id) => `'${id}' = {id persistant}`).join(',')})`,
    });
    const airtableIdsByIds = {};
    for (const skillId of skillIds) {
      airtableIdsByIds[skillId] = airtableRawObjects.find((airtableRecord) => airtableRecord.get('id persistant') === skillId)?.get('Record Id');
    }
    return airtableIdsByIds;
  },
});
