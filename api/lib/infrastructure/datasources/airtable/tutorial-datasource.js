import { datasource } from './datasource.js';

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
      crush: airtableRecord.get('CoupDeCoeur'),
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
        'CoupDeCoeur': model.crush,
        'Tags': model.tagAirtableIds,
      },
    };
    if (model.airtableId) airtableObject.id = model.airtableId;
    return airtableObject;
  },
});

