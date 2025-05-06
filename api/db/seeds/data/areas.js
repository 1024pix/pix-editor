import { areaDatasource } from '../../../lib/infrastructure/datasources/airtable/index.js';
import { saveInAirtable } from './utils.js';

export async function buildAreas({ airtableClient, databaseBuilder, logger, learningContentConfig, learningContentData }) {
  const areaData = [];
  for (let i = 0; i < learningContentConfig.countFrameworks; ++i) {
    for (let j = 0; j < learningContentConfig.countAreasPerFramework; ++j) {
      const areaItem = buildArea(i, j, learningContentData);
      addTranslations(learningContentConfig.locales, areaItem, databaseBuilder);
      areaData.push(areaItem);
    }
  }

  const airtableData = areaData.map(areaDatasource.toAirTableObject);

  const records = await saveInAirtable({ tableName: 'Domaines', data: airtableData, logger, airtableClient });

  areaData.forEach((areaItem) => {
    areaItem.airtableId = records.shift().id;
    areaItem.competences = [];
  });
}

function buildArea(indexFramework, indexArea, learningContentData) {
  const frameworkItem = learningContentData[indexFramework];
  const areaId = `areaF${indexFramework}A${indexArea}`;
  const areaTitle = `${areaId} title`;
  const areaItem = {
    id: areaId,
    code: `${indexArea + 1}`,
    frameworkId: frameworkItem.airtableId,
    title: areaTitle,
  };
  frameworkItem.areas.push(areaItem);
  return areaItem;
}

function addTranslations(locales, areaItem, databaseBuilder) {
  locales.forEach((locale) => databaseBuilder.factory.buildTranslation(
    {
      locale,
      key: `area.${areaItem.id}.title`,
      value: `${areaItem.title} ${locale}`,
    }
  ));
}
