import { datasource } from './datasource.js';
import { findRecords, stringValue } from '../../airtable.js';

export const tutorialDatasource = datasource.extend({

  modelName: 'Tutorial',

  tableName: 'Tutoriels',

  usedFields: [
    'id persistant',
    'Durée',
    'Format',
    'Lien',
    'Source',
    'Titre',
    'Langue',
    'License',
    'niveau',
    'CoupDeCoeur',
    'Tags',
    'Solution à',
    'En savoir plus',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id persistant'),
      airtableId: airtableRecord.id,
      duration: airtableRecord.get('Durée'),
      format: airtableRecord.get('Format'),
      link: airtableRecord.get('Lien'),
      source: airtableRecord.get('Source'),
      title: airtableRecord.get('Titre'),
      locale: airtableRecord.get('Langue'),
      language: airtableRecord.get('Langue'),
      license: airtableRecord.get('License'),
      level: airtableRecord.get('niveau'),
      crush: airtableRecord.get('CoupDeCoeur') === 'YES',
      tagAirtableIds: airtableRecord.get('Tags') ?? [],
      tutorialForSkills: airtableRecord.get('Solution à'),
      furtherInformation: airtableRecord.get('En savoir plus'),
    };
  },

  toAirTableObject(model) {
    const airtableObject = {
      fields: {
        'id persistant': model.id,
        'Durée': model.duration,
        'Format': model.format,
        'Lien': model.link,
        'Source': model.source,
        'Titre': model.title,
        'Langue': model.language,
        'License': model.license,
        'niveau': model.level,
        'CoupDeCoeur': model.crush ? 'YES' : null,
        'Tags': model.tagAirtableIds,
      },
    };
    if (model.airtableId) airtableObject.id = model.airtableId;
    return airtableObject;
  },

  async searchByTitle(title) {
    const filterByFormula = `FIND(${stringValue(title.toLowerCase())}, LOWER(Titre))`;
    const records = await findRecords(this.tableName, {
      filterByFormula,
      fields: this.usedFields,
      sort: [{ field: 'Titre', direction: 'asc' }],
      maxRecords: 100,
    });

    if (records.length === 0) return undefined;
    return records.map(this.fromAirTableObject);
  },

  async searchBySource(source) {
    const filterByFormula = `FIND(${stringValue(source.toLowerCase())}, LOWER(Source))`;
    const records = await findRecords(this.tableName, {
      filterByFormula,
      fields: this.usedFields,
      sort: [{ field: 'Titre', direction: 'asc' }],
      maxRecords: 4,
    });

    if (records.length === 0) return undefined;
    return records.map(this.fromAirTableObject);
  },

  async searchByTagTitles(tagTitles) {
    // Note: LOWER(Tags) works because, in table Tags in Airtable, main column is the "title" column
    const findQueries = tagTitles.map((tagTitle) => `FIND(${stringValue(tagTitle.toLowerCase())}, LOWER(Tags))`);
    const filterByFormula = `AND(${findQueries.join(',')})`;
    const records = await findRecords(this.tableName, {
      filterByFormula,
      fields: this.usedFields,
      sort: [{ field: 'Titre', direction: 'asc' }],
      maxRecords: 100,
    });

    if (records.length === 0) return undefined;
    return records.map(this.fromAirTableObject);
  },
});

