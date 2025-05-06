import { competenceDatasource } from '../../../lib/infrastructure/datasources/airtable/index.js';
import { saveInAirtable } from './utils.js';

export async function buildCompetences({ airtableClient, databaseBuilder, logger, learningContentConfig, learningContentData }) {
  const competenceData = [];
  for (let i = 0; i < learningContentConfig.countFrameworks; ++i) {
    for (let j = 0; j < learningContentConfig.countAreasPerFramework; ++j) {
      for (let k = 0; k < learningContentConfig.countCompetencesPerArea; ++k) {
        const competenceItem = buildCompetence(i, j, k, learningContentData);
        addTranslations(learningContentConfig.locales, competenceItem, databaseBuilder);
        competenceData.push(competenceItem);
      }
    }
  }
  const airtableData = competenceData.map(competenceDatasource.toAirTableObject);

  const records = await saveInAirtable({ tableName: 'Competences', data: airtableData, logger, airtableClient });

  competenceData.forEach((competenceItem) => {
    competenceItem.airtableId = records.shift().id;
    competenceItem.thematics = [];
  });
}

function buildCompetence(indexFramework, indexArea, indexCompetence, learningContentData) {
  const currentAreaItem = learningContentData[indexFramework].areas[indexArea];
  const competenceId = `competenceF${indexFramework}A${indexArea}C${indexCompetence}`;
  const competenceName = `${competenceId} name`;
  const competenceDescription = `${competenceId} description`;
  const competenceItem = {
    id: competenceId,
    index: `${indexArea + 1}.${indexCompetence + 1}`,
    areaAirtableId: currentAreaItem.airtableId,
    areaId: currentAreaItem.id,
    name: competenceName,
    description: competenceDescription,
  };
  currentAreaItem.competences.push(competenceItem);
  return competenceItem;
}

function addTranslations(locales, competenceItem, databaseBuilder) {
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
}
