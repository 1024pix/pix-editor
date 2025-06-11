import { tagDatasource } from '../../../lib/infrastructure/datasources/airtable/index.js';
import { saveInAirtable } from './utils.js';

export async function buildTags({ airtableClient, logger }) {
  const tagItems = [];
  let i = 0;
  tagItems.push(buildTag({ title: 'fruits', index: i++ }));
  tagItems.push(buildTag({ title: 'légumes', index: i++ }));
  tagItems.push(buildTag({ title: 'animaux', index: i++ }));
  tagItems.push(buildTag({ title: 'plantes', index: i++ }));
  tagItems.push(buildTag({ title: 'minéraux', index: i++ }));

  await persistTags({ items: tagItems, airtableClient, logger });
  return tagItems;
}

export function buildTag({ title, index }) {
  const tagId = `tag${index}`;
  return {
    id: tagId,
    title,
    description: `description for ${tagId}`,
    notes: `notes for ${tagId}`,
    skillAirtableIds: [],
    tutorialAirtableIds: [],
  };
}

export async function persistTags({ items, airtableClient, logger }) {
  const airtableItems = items.map(tagDatasource.toAirTableObject);
  const records = await saveInAirtable({ tableName: 'Tags', data: airtableItems, logger, airtableClient });
  items.forEach((item) => {
    item.airtableId = records.shift().id;
  });
}
