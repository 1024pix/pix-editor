import { areaDatasource } from '../../../lib/infrastructure/datasources/airtable/index.js';
import { saveInAirtable } from './utils.js';

export async function buildAreasFromConfig({ airtableClient, databaseBuilder, logger, learningContentConfig, learningContentData }) {
  const areaItems = [];
  for (let i = 0; i < learningContentConfig.cntFrameworks; ++i) {
    for (let j = 0; j < learningContentConfig.cntAreasPerFramework; ++j) {
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
  const id = `areaF${indexFramework}A${indexArea}`;
  const code = `${indexArea + 1}`;
  const title = `${id} title`;

  databaseBuilder.factory.buildArea({
    id: id,
    code,
    frameworkId: frameworkItem.id,
  });

  locales.forEach((locale) => {
    databaseBuilder.factory.buildTranslation({
      locale,
      key: `area.${id}.title`,
      value: `${title} ${locale}`,
    });
  });

  return {
    id,
    code,
    frameworkId: frameworkItem.airtableId,
  };
}

export async function persistAreas({ items, airtableClient, logger }) {
  const airtableItems = items.map(areaDatasource.toAirTableObject);
  const records = await saveInAirtable({ tableName: 'Domaines', data: airtableItems, logger, airtableClient });
  items.forEach((item) => {
    item.airtableId = records.shift().id;
  });
}
