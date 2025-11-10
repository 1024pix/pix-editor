import { competenceDatasource } from '../../../lib/infrastructure/datasources/airtable/index.js';
import { saveInAirtable } from './utils.js';

export async function buildCompetencesFromConfig({
  airtableClient,
  databaseBuilder,
  logger,
  learningContentConfig,
  learningContentData,
}) {
  const competenceItems = [];
  const allAreas = learningContentData.flatMap((framework) => framework.areas);
  for (const areaItem of allAreas) {
    for (let i = 0; i < learningContentConfig.cntCompetencesPerArea; ++i) {
      const competenceItem = buildCompetence({
        indexCompetence: i,
        areaItem,
        databaseBuilder,
        locales: learningContentConfig.locales,
      });
      areaItem.competences.push(competenceItem);
      competenceItems.push(competenceItem);
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
  databaseBuilder.factory.buildCompetence(competenceItem);
  locales.forEach((locale) => {
    databaseBuilder.factory.buildTranslation({
      locale,
      key: `competence.${competenceItem.id}.name`,
      value: `${competenceItem.name} ${locale}`,
    });
    databaseBuilder.factory.buildTranslation({
      locale,
      key: `competence.${competenceItem.id}.description`,
      value: `${competenceItem.description} ${locale}`,
    });
  });
  return competenceItem;
}

export async function persistCompetences({ items, airtableClient, logger }) {
  const airtableItems = items.map(competenceDatasource.toAirTableObject);
  const records = await saveInAirtable({
    tableName: 'Competences',
    data: airtableItems,
    logger,
    airtableClient,
  });
  items.forEach((item) => {
    const record = records.shift();
    item.airtableId = record.id;
    item.origin = record.fields['Origine2'];
  });
}

export async function copyCompetencesFromAirtable({ airtableClient, databaseBuilder, logger }) {
  const airtableCompetences = await airtableClient
    .table('Competences')
    .select({
      fields: [
        'id persistant',
        'Sous-domaine',
        'Domaine (id persistant)',
      ],
    })
    .all();

  logger.info(`Copying ${airtableCompetences.length} competences from airtable...`);

  airtableCompetences.forEach((record) => {
    databaseBuilder.factory.buildCompetence({
      id: record.get('id persistant'),
      index: record.get('Sous-domaine'),
      areaId: record.get('Domaine (id persistant)')[0],
      createdAt: record._rawJson.createdTime,
      updatedAt: new Date(),
    });
  });
}
