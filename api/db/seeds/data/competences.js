import { competenceDatasource } from '../../../lib/infrastructure/datasources/airtable/index.js';
import { saveInAirtable } from './utils.js';

export async function buildCompetencesFromConfig({ airtableClient, databaseBuilder, logger, learningContentConfig, learningContentData }) {
  const competenceItems = [];
  for (const frameworkItem of learningContentData) {
    for (const areaItem of frameworkItem.areas) {
      for (let i = 0; i < learningContentConfig.countCompetencesPerArea; ++i) {
        const competenceItem = buildCompetence({ indexCompetence: i, areaItem, databaseBuilder, locales: learningContentConfig.locales });
        areaItem.competences.push(competenceItem);
        competenceItems.push(competenceItem);
      }
    }
  }
  await persistCompetences({ items: competenceItems, airtableClient, logger });
  competenceItems.forEach((competenceItem) => {
    competenceItem.thematics = [];
  });
}

export function buildCompetence({ indexCompetence, areaItem, databaseBuilder, locales }) {
  const partId = areaItem.id.split('area')[1];
  const competenceId = `competence${partId}C${indexCompetence}`;
  const competenceName = `${competenceId} name`;
  const competenceDescription = `${competenceId} description`;
  const competenceItem = {
    id: competenceId,
    index: `${areaItem.code}.${indexCompetence + 1}`,
    areaAirtableId: areaItem.airtableId,
    areaId: areaItem.id,
    name: competenceName,
    description: competenceDescription,
  };
  locales.forEach((locale) => {
    databaseBuilder.factory.buildTranslation(
      {
        locale,
        key: `competence.${competenceItem.id}.name`,
        value: `${competenceItem.name} ${locale}`,
      }
    );
    databaseBuilder.factory.buildTranslation(
      {
        locale,
        key: `competence.${competenceItem.id}.description`,
        value: `${competenceItem.description} ${locale}`,
      }
    );
  });
  return competenceItem;
}

export async function persistCompetences({ items, airtableClient, logger }) {
  const airtableItems = items.map(competenceDatasource.toAirTableObject);
  const records = await saveInAirtable({ tableName: 'Competences', data: airtableItems, logger, airtableClient });
  items.forEach((item) => {
    const record = records.shift();
    item.airtableId = record.id;
    item.origin = record.fields['Origine2'];
  });
}
