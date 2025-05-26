import { datasource } from './datasource.js';
import { findRecords, stringValue } from '../../airtable.js';
import { Skill } from '../../../domain/models/Skill.js';

export const skillDatasource = datasource.extend({

  modelName: 'Skill',

  tableName: 'Acquis',

  airtableIdField: 'Record Id',

  usedFields: [
    'id persistant',
    'Record Id',
    'Nom',
    'Statut de l\'indice',
    'Comprendre',
    'Comprendre (id persistant)',
    'En savoir plus',
    'En savoir plus (id persistant)',
    'PixValue',
    'Compétence (via Tube) (id persistant)',
    'Status',
    'Tube',
    'Tube (id persistant)',
    'Description',
    'Level',
    'Internationalisation',
    'Version',
    'Date',
    'Statut de la description',
    'Epreuves (id persistant)',
  ],

  sortableFields: {
    name: 'Nom',
  },

  fromAirTableObject(airtableRecord) {

    return {
      id: airtableRecord.get('id persistant'),
      airtableId: airtableRecord.get('Record Id'),
      name: airtableRecord.get('Nom'),
      hintStatus: airtableRecord.get('Statut de l\'indice') ?? '',
      tutorialIds: airtableRecord.get('Comprendre (id persistant)') ?? [],
      tutorialAirtableIds: airtableRecord.get('Comprendre') ?? [],
      learningMoreTutorialIds: airtableRecord.get('En savoir plus (id persistant)') ?? [],
      learningMoreTutorialAirtableIds: airtableRecord.get('En savoir plus') ?? [],
      pixValue: airtableRecord.get('PixValue'),
      competenceId: airtableRecord.get('Compétence (via Tube) (id persistant)')?.[0],
      status: airtableRecord.get('Status'),
      tubeId: airtableRecord.get('Tube (id persistant)')?.[0],
      tubeAirtableId: airtableRecord.get('Tube')?.[0],
      description: airtableRecord.get('Description'),
      level: airtableRecord.get('Level'),
      internationalisation: airtableRecord.get('Internationalisation'),
      version: airtableRecord.get('Version'),
      createdAt: airtableRecord.get('Date'),
      descriptionStatus: airtableRecord.get('Statut de la description'),
      challengeIds: airtableRecord.get('Epreuves (id persistant)') ?? [],
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
    const body = {
      fields: {
        'id persistant': model.id,
        'Statut de l\'indice': model.hintStatus,
        'Comprendre': model.tutorialAirtableIds,
        'En savoir plus': model.learningMoreTutorialAirtableIds,
        'Status': model.status,
        'Tube': [model.tubeAirtableId],
        'Description': model.description,
        'Statut de la description': model.descriptionStatus,
        'Level': model.level,
        'Internationalisation': model.internationalisation,
        'Version': model.version,
      }
    };
    if (model.airtableId) {
      body.id = model.airtableId;
    }
    return body;
  },

  async filterByTubeId(tubeId) {
    const airtableRawObjects = await findRecords(this.tableName, {
      filterByFormula: `{Tube (id persistant)} = ${stringValue(tubeId)}`,
    });
    if (airtableRawObjects.length === 0) return undefined;
    return airtableRawObjects.map(this.fromAirTableObject);
  },

  async listActiveByCompetenceId(competenceId) {
    const airtableRawObjects = await findRecords(this.tableName, {
      fields: this.usedFields,
      filterByFormula: `AND({Compétence (via Tube) (id persistant)} = ${stringValue(competenceId)}, {Status} = ${stringValue(Skill.STATUSES.ACTIF)})`,
    });
    if (airtableRawObjects.length === 0) return undefined;
    return airtableRawObjects.map(this.fromAirTableObject);
  },

  async listByCompetenceId(competenceId) {
    const airtableRawObjects = await findRecords(this.tableName, {
      fields: this.usedFields,
      filterByFormula: `{Compétence (via Tube) (id persistant)} = ${stringValue(competenceId)}`,
    });
    if (airtableRawObjects.length === 0) return undefined;
    return airtableRawObjects.map(this.fromAirTableObject);
  },

  async search(params) {
    const filterByFormula = `FIND(${stringValue(params.filter.name.toLowerCase())}, LOWER(Nom))`;

    let sort = params.sort?.filter(([field]) => this.sortableFields[field]).map(([field, direction]) => ({
      field: this.sortableFields[field],
      direction,
    }));
    if (!sort?.length) {
      sort = this.defaultSort();
    }

    const maxRecords = params.page?.limit;

    const records = await findRecords(this.tableName, {
      filterByFormula,
      fields: this.usedFields,
      sort,
      maxRecords,
    });

    if (records.length === 0) return undefined;
    return records.map(this.fromAirTableObject);
  },
});
