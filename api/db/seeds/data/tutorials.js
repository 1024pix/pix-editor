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
export async function buildTutorials({ airtableClient, databaseBuilder, logger, locales, tagItems }) {
  iterTags = cycle(tagItems);
  iterLocales = cycle(locales);
  const tutorialItems = [];
  let i = 0;
  tutorialItems.push(buildTutorial({ databaseBuilder, title: 'Faire ses courses', index: i++, tagItems: [] }));
  tutorialItems.push(buildTutorial({ databaseBuilder, title: 'Se laver les dents', index: i++, tagItems: [iterTags.next().value] }));
  tutorialItems.push(buildTutorial({ databaseBuilder, title: 'Payer ses impôts', index: i++, tagItems: [iterTags.next().value, iterTags.next().value] }));
  tutorialItems.push(buildTutorial({ databaseBuilder, title: 'Faire son lit', index: i++, tagItems: [] }));
  tutorialItems.push(buildTutorial({ databaseBuilder, title: 'Saluer ses voisins', index: i++, tagItems: [iterTags.next().value] }));

  await persistTutorials({ items: tutorialItems, airtableClient, logger });
  return tutorialItems;
}

export function buildTutorial({ databaseBuilder, title, index, tagItems }) {
  const tutorialId = `tutorial${index}`;
  const tutorial = {
    id: tutorialId,
    title: `${title} - Tuto${index}`,
    duration: `0${index}:0${index}:0${index}`,
    source: `My source ${index}`,
    format: iterFor.format.next().value,
    link: `https://link-to-tuto${index}.com`,
    license: iterFor.license.next().value,
    level: iterFor.level.next().value,
    crush: iterFor.crush.next().value,
    locale: iterLocales.next().value,
    tagAirtableIds: tagItems.map((tagItem) => tagItem.airtableId),
    tagIds: tagItems.map((tagItem) => tagItem.id),
  };
  databaseBuilder.factory.buildTutorial(tutorial);
  return tutorial;
}

export async function persistTutorials({ items, airtableClient, logger }) {
  const airtableItems = items.map(tutorialDatasource.toAirTableObject);
  const records = await saveInAirtable({ tableName: 'Tutoriels', data: airtableItems, logger, airtableClient });
  items.forEach((item) => {
    item.airtableId = records.shift().id;
  });
}

export async function copyTutorialsFromAirtable({ airtableClient, databaseBuilder, logger }) {
  const airtableTutorials = await  airtableClient.table('Tutoriels').select({ fields: [
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
    'Tags (id persistant)',
  ] }).all();

  logger.info(`Copying ${airtableTutorials.length} tutorials from airtable...`);

  airtableTutorials.forEach((record) => {
    databaseBuilder.factory.buildTutorial({
      id: record.get('id persistant'),
      duration: record.get('Durée'),
      format: record.get('Format'),
      link: record.get('Lien'),
      source: record.get('Source'),
      title: record.get('Titre'),
      locale: record.get('Langue'),
      license: record.get('License'),
      level: record.get('niveau'),
      crush: record.get('CoupDeCoeur') === 'YES',
      tagIds: record.get('Tags (id persistant)'),
      createdAt: record._rawJson.createdTime,
      updatedAt: new Date(),
    });
  });
}
