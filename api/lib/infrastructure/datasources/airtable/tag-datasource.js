import { datasource } from './datasource.js';

export const tagDatasource = datasource.extend({
  modelName: 'Tag',
  tableName: 'Tags',

  usedFields: [
    'id persistant',
    'Nom',
    'Description',
    'Notes',
    'Acquis',
    'Tutoriels',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id persistant'),
      airtableId: airtableRecord.id,
      title: airtableRecord.get('Nom'),
      description: airtableRecord.get('Description'),
      notes: airtableRecord.get('Notes'),
      skillAirtableId: airtableRecord.get('Acquis')?.[0],
      tutorialAirtableIds: airtableRecord.get('Tutoriels') || [],
    };
  },

  toAirTableObject(tag) {
    const payload = {
      fields: {
        'id persistant': tag.id,
        'Nom': tag.title,
        'Description': tag.description,
        'Notes': tag.notes,
      },
    };
    if (tag.skillAirtableId) {
      payload.fields['Acquis'] = [tag.skillAirtableId];
    }
    if (tag.tutorialAirtableIds && tag.tutorialAirtableIds.length > 0) {
      console.log(tag.tutorialAirtableIds);
      payload.fields['Tutoriels'] = tag.tutorialAirtableIds;
    }

    if (tag.airtableId) {
      payload.id = tag.airtableId;
    }

    return payload;
  },
});
