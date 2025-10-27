import { saveInAirtable } from './utils.js';

export async function buildThematicsFromConfig({
  airtableClient,
  databaseBuilder,
  logger,
  learningContentConfig,
  learningContentData,
}) {
  const thematicItems = [];
  const allCompetences = learningContentData.flatMap((framework) =>
    framework.areas.flatMap((area) => area.competences),
  );
  for (const competenceItem of allCompetences) {
    for (let i = 0; i < learningContentConfig.cntThematicsPerCompetence; ++i) {
      const thematicItem = buildThematic({
        indexThematic: i,
        competenceItem,
        databaseBuilder,
        locales: learningContentConfig.locales,
        isWorkbench: false,
      });
      thematicItems.push(thematicItem);
      competenceItem.thematics.push(thematicItem);
    }
    const thematicWorkbenchItem = buildThematic({
      competenceItem,
      databaseBuilder,
      locales: learningContentConfig.locales,
      isWorkbench: true,
    });
    thematicItems.push(thematicWorkbenchItem);
    competenceItem.thematics.push(thematicWorkbenchItem);
  }
  await persistThematics({ items: thematicItems, airtableClient, logger });
  thematicItems.forEach((thematicItem) => {
    thematicItem.tubes = [];
  });
}

export function buildThematic({ indexThematic, competenceItem, databaseBuilder, locales, isWorkbench }) {
  const partId = competenceItem.id.split('competence')[1];
  const thematicId = `thematic${partId}Th${isWorkbench ? 'W' : indexThematic}`;
  let thematicName;
  if (isWorkbench) {
    if (competenceItem.origin === 'Pix') {
      thematicName = `workbench_${competenceItem.index.split('.')[0]}_${competenceItem.index.split('.')[1]}`;
    } else {
      thematicName = `workbench_${competenceItem.origin}_${competenceItem.index.split('.')[0]}_${competenceItem.index.split('.')[1]}`;
    }
  } else {
    thematicName = `${thematicId} name`;
  }
  const thematicItem = {
    id: thematicId,
    index: isWorkbench ? 0 : indexThematic,
    competenceAirtableId: competenceItem.airtableId,
    competenceId: competenceItem.id,
    name: thematicName,
  };
  databaseBuilder.factory.buildThematic(thematicItem);
  locales.forEach((locale) => {
    databaseBuilder.factory.buildTranslation({
      locale,
      key: `thematic.${thematicItem.id}.name`,
      value: `${thematicItem.name} ${locale}`,
    });
  });
  return thematicItem;
}

export async function persistThematics({ items, airtableClient, logger }) {
  const airtableItems = items.map(toAirtableObject);
  const records = await saveInAirtable({
    tableName: 'Thematiques',
    data: airtableItems,
    logger,
    airtableClient,
  });
  items.forEach((item) => {
    item.airtableId = records.shift().id;
  });
}

function toAirtableObject(item) {
  return {
    fields: {
      'id persistant': item.id,
      Index: item.index,
      Competence: [item.competenceAirtableId],
    },
  };
}

export async function copyThematicsFromAirtable({ airtableClient, databaseBuilder, logger }) {
  const airtableThematics = await airtableClient
    .table('Thematiques')
    .select({
      fields: ['id persistant', 'Index', 'Competence (id persistant)'],
    })
    .all();

  logger.info(`Copying ${airtableThematics.length} thematics from airtable...`);

  airtableThematics.forEach((record) => {
    databaseBuilder.factory.buildThematic({
      id: record.get('id persistant'),
      index: record.get('Index'),
      competenceId: record.get('Competence (id persistant)')[0],
      createdAt: record._rawJson.createdTime,
      updatedAt: new Date(),
    });
  });
}
