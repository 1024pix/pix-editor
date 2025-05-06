import { saveInAirtable } from './utils.js';

export async function buildThematics({ airtableClient, databaseBuilder, logger, learningContentConfig, learningContentData }) {
  const thematicData = [];
  for (let i = 0; i < learningContentConfig.countFrameworks; ++i) {
    for (let j = 0; j < learningContentConfig.countAreasPerFramework; ++j) {
      for (let k = 0; k < learningContentConfig.countCompetencesPerArea; ++k) {
        for (let l = 0; l < learningContentConfig.countThematicsPerCompetence; ++l) {
          const thematicItem = buildThematic(i, j, k, l, learningContentData);
          addTranslations(learningContentConfig.locales, thematicItem, databaseBuilder);
          thematicData.push(thematicItem);
        }
        const thematicWorkbenchItem = buildThematicWorkbench(i, j, k, learningContentData);
        thematicData.push(thematicWorkbenchItem);
        addTranslations(learningContentConfig.locales, thematicWorkbenchItem, databaseBuilder);
      }
    }
  }
  const airtableData = thematicData.map(toAirtableObject);

  const records = await saveInAirtable({ tableName: 'Thematiques', data: airtableData, logger, airtableClient });

  thematicData.forEach((thematicItem) => {
    thematicItem.airtableId = records.shift().id;
    thematicItem.tubes = [];
  });
}

function buildThematic(indexFramework, indexArea, indexCompetence, indexThematic, learningContentData) {
  const currentCompetenceItem = learningContentData[indexFramework].areas[indexArea].competences[indexCompetence];
  const thematicId = `thematicF${indexFramework}A${indexArea}C${indexCompetence}Th${indexThematic}`;
  const thematicName = `${thematicId} name`;
  const thematicItem = {
    id: thematicId,
    index: indexThematic,
    competenceAirtableId: currentCompetenceItem.airtableId,
    name: thematicName,
  };
  currentCompetenceItem.thematics.push(thematicItem);
  return thematicItem;
}

function buildThematicWorkbench(indexFramework, indexArea, indexCompetence, learningContentData) {
  const thematicWorkbenchId = `thematicF${indexFramework}A${indexArea}C${indexCompetence}ThW`;
  const currentFrameworkItem = learningContentData[indexFramework];
  const currentCompetenceItem = learningContentData[indexFramework].areas[indexArea].competences[indexCompetence];
  let thematicWorkbenchName;
  if (currentFrameworkItem.name === 'Pix') {
    thematicWorkbenchName = `workbench_${indexArea + 1}_${indexCompetence + 1}`;
  } else {
    thematicWorkbenchName = `workbench_${currentFrameworkItem.name}_${indexArea + 1}_${indexCompetence + 1}`;
  }
  const thematicWorkbenchItem = {
    id: thematicWorkbenchId,
    index: 0,
    competenceAirtableId: currentCompetenceItem.airtableId,
    name: thematicWorkbenchName,
  };
  currentCompetenceItem.thematics.push(thematicWorkbenchItem);
  return thematicWorkbenchItem;
}

function addTranslations(locales, thematicItem, databaseBuilder) {
  locales.forEach((locale) => {
    databaseBuilder.factory.buildTranslation(
      {
        locale,
        key: `thematic.${thematicItem.id}.name`,
        value: `${thematicItem.name} ${locale}`,
      }
    );
  });
}

function toAirtableObject(item) {
  return {
    fields: {
      'id persistant': item.id,
      'Index': item.index,
      Competence: [item.competenceAirtableId],
    }
  };
}
