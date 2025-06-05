import { cycle, saveInAirtable } from './utils.js';
import { Tutorial } from '../../../lib/domain/models/index.js';
import { tutorialDatasource } from '../../../lib/infrastructure/datasources/airtable/index.js';

const iterFor = {
  'format': cycle(Object.values(Tutorial.FORMATS)),
  'level': cycle(Object.values(Tutorial.LEVELS)),
  'license': cycle(Object.values(Tutorial.LICENSES)),
  'crush': cycle([true, false]),
};
let iterTags;
let iterLocales;
export async function buildTutorials({ airtableClient, logger, locales, tagItems }) {
  iterTags = cycle(tagItems);
  iterLocales = cycle(locales);
  const tutorialItems = [];
  let i = 0;
  tutorialItems.push(buildTutorial({ title: 'Faire ses courses', index: i++, tagItems: [] }));
  tutorialItems.push(buildTutorial({ title: 'Se laver les dents', index: i++, tagItems: [iterTags.next().value] }));
  tutorialItems.push(buildTutorial({ title: 'Payer ses impôts', index: i++, tagItems: [iterTags.next().value, iterTags.next().value] }));
  tutorialItems.push(buildTutorial({ title: 'Faire son lit', index: i++, tagItems: [] }));
  tutorialItems.push(buildTutorial({ title: 'Saluer ses voisins', index: i++, tagItems: [iterTags.next().value] }));

  await persistTutorials({ items: tutorialItems, airtableClient, logger });
  return tutorialItems;
}

export function buildTutorial({ title, index, tagItems }) {
  const tutorialId = `tutorial${index}`;
  return {
    id: tutorialId,
    title: `${title} - Tuto${index}`,
    duration: `0${index}:0${index}:0${index}`,
    source: `My source ${index}`,
    format: iterFor.format.next().value,
    link: `https://link-to-tuto${index}.com`,
    license: iterFor.license.next().value,
    level: iterFor.level.next().value,
    crush: iterFor.crush.next().value,
    language: iterLocales.next().value,
    tagAirtableIds: tagItems.map((tagItem) => tagItem.airtableId),
  };
}

export async function persistTutorials({ items, airtableClient, logger }) {
  const airtableItems = items.map(tutorialDatasource.toAirTableObject);
  const records = await saveInAirtable({ tableName: 'Tutoriels', data: airtableItems, logger, airtableClient });
  items.forEach((item) => {
    item.airtableId = records.shift().id;
  });
}
