import { tagDatasource } from '../../../lib/infrastructure/datasources/airtable/index.js';
import { saveInAirtable } from './utils.js';

export async function buildTags({ airtableClient, logger, databaseBuilder }) {
  const tagItems = [];
  let i = 0;
  tagItems.push(buildTag({ title: 'fruits', index: i++, databaseBuilder }));
  tagItems.push(buildTag({ title: 'légumes', index: i++, databaseBuilder }));
  tagItems.push(buildTag({ title: 'animaux', index: i++, databaseBuilder }));
  tagItems.push(buildTag({ title: 'plantes', index: i++, databaseBuilder }));
  tagItems.push(buildTag({ title: 'minéraux', index: i++, databaseBuilder }));

  await persistTags({ items: tagItems, airtableClient, logger });
  return tagItems;
}

export function buildTag({ title, index, databaseBuilder }) {
  const tagId = `tag${index}`;
  const tag = {
    id: tagId,
    title,
    description: `description for ${tagId}`,
    notes: `notes for ${tagId}`,
    skillAirtableIds: [],
    tutorialAirtableIds: [],
  };
  databaseBuilder.factory.buildTag(tag);
  return tag;
}

export async function persistTags({ items, airtableClient, logger }) {
  const airtableItems = items.map(tagDatasource.toAirTableObject);
  const records = await saveInAirtable({ tableName: 'Tags', data: airtableItems, logger, airtableClient });
  items.forEach((item) => {
    item.airtableId = records.shift().id;
  });
}

export async function copyTutorialTagsFromAirtable({ airtableClient, databaseBuilder, logger }) {
  const airtableTutorialTags = await  airtableClient.table('Tags').select({ fields: ['id persistant', 'Nom', 'Notes'] }).all();

  logger.info(`Copying ${airtableTutorialTags.length} tutorial tags from airtable...`);

  airtableTutorialTags.forEach((record) => {
    databaseBuilder.factory.buildTag({
      id: record.get('id persistant'),
      title: record.get('Nom'),
      notes: record.get('Notes'),
      createdAt: record._rawJson.createdTime,
      updatedAt: new Date(),
    });
  });
}
