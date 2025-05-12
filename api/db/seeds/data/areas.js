import { areaDatasource } from '../../../lib/infrastructure/datasources/airtable/index.js';
import { saveInAirtable } from './utils.js';

export async function buildAreasFromConfig({ airtableClient, databaseBuilder, logger, learningContentConfig, learningContentData }) {
  const areaItems = [];
  for (let i = 0; i < learningContentConfig.countFrameworks; ++i) {
    for (let j = 0; j < learningContentConfig.countAreasPerFramework; ++j) {
      const frameworkItem = learningContentData[i];
      const areaItem = buildArea({ indexFramework: i, indexArea: j, frameworkItem, databaseBuilder, locales: learningContentConfig.locales });
      frameworkItem.areas.push(areaItem);
      areaItems.push(areaItem);
    }
  }

  await persistAreas({ items: areaItems, airtableClient, logger });
  areaItems.forEach((areaItem) => {
    areaItem.competences = [];
  });
}

export function buildArea({ indexFramework, indexArea, frameworkItem, databaseBuilder, locales }) {
  const areaId = `areaF${indexFramework}A${indexArea}`;
  const areaTitle = `${areaId} title`;
  const areaItem = {
    id: areaId,
    code: `${indexArea + 1}`,
    frameworkId: frameworkItem.airtableId,
    title: areaTitle,
  };
  locales.forEach((locale) => databaseBuilder.factory.buildTranslation(
    {
      locale,
      key: `area.${areaItem.id}.title`,
      value: `${areaItem.title} ${locale}`,
    }
  ));
  return areaItem;
}

export async function persistAreas({ items, airtableClient, logger }) {
  const airtableItems = items.map(areaDatasource.toAirTableObject);
  const records = await saveInAirtable({ tableName: 'Domaines', data: airtableItems, logger, airtableClient });
  items.forEach((item) => {
    item.airtableId = records.shift().id;
  });
}
