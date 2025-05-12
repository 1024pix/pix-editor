import { saveInAirtable } from './utils.js';

const TUBE_NAMES_POOL = [
  'noix',
  'amande',
  'cajou',
  'pistache',
  'noisette',
  'abricot',
  'banane',
  'courgette',
  'datte',
  'epinard',
  'fraise',
  'goyave',
  'haricot',
  'igname',
  'jujube',
  'kaki',
  'laitue',
  'mandarine',
  'nefle',
  'orange',
  'panais',
  'quenette',
  'raisin',
  'salsifis',
  'topinambour',
  'usufruit',
  'vruit',
  'wagon',
  'xylophone',
  'yack',
  'zebre',
  'brocoli',
  'poireau',
  'cresson',
  'pasteque',
  'papaye',
  'olive',
  'myrtille',
  'kiwi',
  'groseille',
  'pomme',
  'coing',
];

function* getTubeName() {
  let i = 0;
  let j = 1;
  while (true) {
    yield `${TUBE_NAMES_POOL[j]}${TUBE_NAMES_POOL[i].at(0).toUpperCase() + TUBE_NAMES_POOL[i].slice(1)}`;
    ++i;
    if (i === TUBE_NAMES_POOL.length) {
      ++j;
      i = 0;
    }
    if (j === TUBE_NAMES_POOL.length) {
      j = 0;
    }
  }
}

const pickTubeName = getTubeName();

export async function buildTubesFromConfig({
  airtableClient,
  databaseBuilder,
  logger,
  learningContentConfig,
  learningContentData,
}) {
  const tubeItems = [];
  for (const frameworkItem of learningContentData) {
    for (const areaItem of frameworkItem.areas) {
      for (const competenceItem of areaItem.competences) {
        for (const thematicItem of competenceItem.thematics) {
          if (thematicItem.name.includes('workbench')) {
            const tubeItemWorkbench = buildTube({ thematicItem, databaseBuilder, locales: learningContentConfig.locales, isWorkbench: true });
            thematicItem.tubes.push(tubeItemWorkbench);
            tubeItems.push(tubeItemWorkbench);
          } else {
            for (let i = 0; i < learningContentConfig.countTubesPerThematic; ++i) {
              const tubeItem = buildTube({ indexTube: i, thematicItem, databaseBuilder, locales: learningContentConfig.locales, isWorkbench: false });
              thematicItem.tubes.push(tubeItem);
              tubeItems.push(tubeItem);
            }
          }
        }
      }
    }
  }
  await persistTubes({ items: tubeItems, airtableClient, logger });
  tubeItems.forEach((tubeItem) => {
    tubeItem.skills = [];
  });
}

function toAirtableObject(item) {
  return {
    fields: {
      'id persistant': item.id,
      'Index': item.index,
      'Nom': item.name,
      Competences: [item.competenceAirtableId],
      Thematique: [item.thematicAirtableId],
    }
  };
}

export function buildTube({ indexTube , suffix = '', thematicItem, databaseBuilder, locales, isWorkbench }) {
  const partId = thematicItem.id.split('thematic')[1];
  const tubeId = `tube${partId}Tu${isWorkbench ? 'W' : indexTube}`;
  const tubePracticalDescription = `${tubeId} practicalDescription`;
  const tubePracticalTitle = `${tubeId} practicalTitle`;
  const tubeName = isWorkbench ? '@workbench' : `@${pickTubeName.next().value}${suffix}`;
  const tubeItem = {
    id: tubeId,
    index: isWorkbench ? null : indexTube,
    name: tubeName,
    competenceAirtableId: thematicItem.competenceAirtableId,
    thematicAirtableId: thematicItem.airtableId,
    practicalDescription: tubePracticalDescription,
    practicalTitle: tubePracticalTitle,
  };
  locales.forEach((locale) => {
    databaseBuilder.factory.buildTranslation(
      {
        locale,
        key: `tube.${tubeItem.id}.practicalTitle`,
        value: `${tubeItem.practicalTitle} ${locale}`,
      }
    );
    databaseBuilder.factory.buildTranslation(
      {
        locale,
        key: `tube.${tubeItem.id}.practicalDescription`,
        value: `${tubeItem.practicalDescription} ${locale}`,
      }
    );
  });
  return tubeItem;
}

export async function persistTubes({ items, airtableClient, logger }) {
  const airtableItems = items.map(toAirtableObject);
  const records = await saveInAirtable({ tableName: 'Tubes', data: airtableItems, logger, airtableClient });
  items.forEach((item) => {
    item.airtableId = records.shift().id;
  });
}
