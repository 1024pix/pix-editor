import { frameworkDatasource } from '../../../lib/infrastructure/datasources/airtable/index.js';
import { saveInAirtable } from './utils.js';

export async function buildFrameworks({ airtableClient, databaseBuilder: _, logger, learningContentConfig }) {
  const frameworkData = [];
  for (let i = 0; i < learningContentConfig.countFrameworks; ++i) {
    frameworkData.push(buildFramework(i, i === 0));
  }

  const airtableData = frameworkData.map(frameworkDatasource.toAirTableObject);

  const records = await saveInAirtable({ tableName: 'Referentiel', data: airtableData, logger, airtableClient });

  return frameworkData.map((rawItem) => {
    const airtableId = records.shift().id;
    return {
      ...rawItem,
      airtableId,
      id: airtableId,
      areas: [],
    };
  });
}

function buildFramework(indexFramework, isPix) {
  return {
    name: isPix ? 'Pix' : `RéfComplémentaire_${indexFramework}`
  };
}
