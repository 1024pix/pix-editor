import { frameworkDatasource } from '../../../lib/infrastructure/datasources/airtable/index.js';
import { saveInAirtable } from './utils.js';

export async function buildFrameworksFromConfig({ airtableClient, databaseBuilder: _, logger, learningContentConfig }) {
  const frameworkItems = [];
  for (let i = 0; i < learningContentConfig.cntFrameworks; ++i) {
    const name = i === 0 ? 'Pix' : `RéfComplémentaire_${i}`;
    frameworkItems.push(buildFramework({ name }));
  }

  await persistFrameworks({ items: frameworkItems, airtableClient, logger });
  return frameworkItems.map((frameworkItem) => {
    return {
      ...frameworkItem,
      areas: [],
    };
  });
}

export function buildFramework({ name }) {
  return {
    name,
  };
}

export async function persistFrameworks({ items, airtableClient, logger }) {
  const airtableItems = items.map(frameworkDatasource.toAirTableObject);
  const records = await saveInAirtable({ tableName: 'Referentiel', data: airtableItems, logger, airtableClient });
  items.forEach((item) => {
    const airtableId = records.shift().id;
    item.airtableId = airtableId;
    item.id = airtableId;
  });
}
