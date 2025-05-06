import { pickRandomValueInArr, saveInAirtable } from './utils.js';

const TUBE_NAMES_POOL = [
  'noix',
  'amande',
  'cajou',
  'pistache',
  'noisette',
  'abricot',
  'banane',
  'courgette',
  'datte',
  'epinard',
  'fraise',
  'goyave',
  'haricot',
  'igname',
  'jujube',
  'kaki',
  'laitue',
  'mandarine',
  'nefle',
  'orange',
  'panais',
  'quenette',
  'raisin',
  'salsifis',
  'topinambour',
  'usufruit',
  'vruit',
  'wagon',
  'xylophone',
  'yack',
  'zebre',
  'brocoli',
  'poireau',
  'cresson',
  'pasteque',
  'papaye',
  'olive',
  'myrtille',
  'kiwi',
  'groseille',
  'pomme',
  'coing',
];
let CURRENT_TUBE_NAMES_LEFT = [];

export async function buildTubes({
  airtableClient,
  databaseBuilder,
  logger,
  learningContentConfig,
  learningContentData,
}) {
  const tubeData = [];
  for (let i = 0; i < learningContentConfig.countFrameworks; ++i) {
    for (let j = 0; j < learningContentConfig.countAreasPerFramework; ++j) {
      for (let k = 0; k < learningContentConfig.countCompetencesPerArea; ++k) {
        for (let l = 0; l < learningContentConfig.countThematicsPerCompetence; ++l) {
          for (let m = 0; m < learningContentConfig.countTubesPerThematic; ++m) {
            const tubeItem = buildTube(i, j, k, l, m, learningContentData);
            addTranslations(learningContentConfig.locales, tubeItem, databaseBuilder);
            tubeData.push(tubeItem);
          }
        }
        const tubeWorkbenchItem = buildTubeWorkbench(i, j, k, learningContentData);
        addTranslations(learningContentConfig.locales, tubeWorkbenchItem, databaseBuilder);
        tubeData.push(tubeWorkbenchItem);
      }
    }
  }
  const airtableData = tubeData.map(toAirtableObject);
  const records = await saveInAirtable({ tableName: 'Tubes', data: airtableData, logger, airtableClient });
  tubeData.forEach((tubeItem) => {
    tubeItem.airtableId = records.shift().id;
    tubeItem.skills = [];
  });
}

function toAirtableObject(item) {
  return {
    fields: {
      'id persistant': item.id,
      'Index': item.index,
      'Nom': item.name,
      Competences: [item.competenceAirtableId],
      Thematique: [item.thematicAirtableId],
    }
  };
}

function buildTube(indexFramework, indexArea, indexCompetence, indexThematic, indexTube, learningContentData) {
  const currentCompetenceItem = learningContentData[indexFramework].areas[indexArea].competences[indexCompetence];
  const currentThematicItem = learningContentData[indexFramework].areas[indexArea].competences[indexCompetence].thematics[indexThematic];
  const tubeId = `tubeF${indexFramework}A${indexArea}C${indexCompetence}Th${indexThematic}Tu${indexTube}`;
  const tubePracticalDescription = `${tubeId} practicalDescription`;
  const tubePracticalTitle = `${tubeId} practicalTitle`;
  CURRENT_TUBE_NAMES_LEFT = CURRENT_TUBE_NAMES_LEFT.length > 0 ? CURRENT_TUBE_NAMES_LEFT : structuredClone(TUBE_NAMES_POOL);
  const randomTubeName = pickRandomValueInArr(CURRENT_TUBE_NAMES_LEFT);
  CURRENT_TUBE_NAMES_LEFT.splice(CURRENT_TUBE_NAMES_LEFT.indexOf(randomTubeName), 1);
  const tubeName = `@${randomTubeName}`;
  const tubeItem = {
    id: tubeId,
    index: indexTube,
    name: tubeName,
    competenceAirtableId: currentCompetenceItem.airtableId,
    thematicAirtableId: currentThematicItem.airtableId,
    practicalDescription: tubePracticalDescription,
    practicalTitle: tubePracticalTitle,
  };
  currentThematicItem.tubes.push(tubeItem);
  return tubeItem;
}

function buildTubeWorkbench(indexFramework, indexArea, indexCompetence, learningContentData) {
  const currentCompetenceItem = learningContentData[indexFramework].areas[indexArea].competences[indexCompetence];
  const thematicWorkbenchItem = learningContentData[indexFramework].areas[indexArea].competences[indexCompetence].thematics.at(-1);
  const tubeWorkbenchId = `tubeF${indexFramework}A${indexArea}C${indexCompetence}ThWTuW`;
  const tubeWorkbenchPracticalDescription = `${tubeWorkbenchId} practicalDescription`;
  const tubeWorkbenchPracticalTitle = `${tubeWorkbenchId} practicalTitle`;
  const tubeWorkbenchName = '@workbench';
  const tubeWorkbenchItem = {
    id: tubeWorkbenchId,
    index: null,
    name: tubeWorkbenchName,
    competenceAirtableId: currentCompetenceItem.airtableId,
    thematicAirtableId: thematicWorkbenchItem.airtableId,
    practicalDescription: tubeWorkbenchPracticalDescription,
    practicalTitle: tubeWorkbenchPracticalTitle,
  };
  thematicWorkbenchItem.tubes.push(tubeWorkbenchItem);
  return tubeWorkbenchItem;
}

function addTranslations(locales, tubeItem, databaseBuilder) {
  locales.forEach((locale) => {
    databaseBuilder.factory.buildTranslation(
      {
        locale,
        key: `tube.${tubeItem.id}.practicalTitle`,
        value: `${tubeItem.practicalTitle} ${locale}`,
      }
    );
    databaseBuilder.factory.buildTranslation(
      {
        locale,
        key: `tube.${tubeItem.id}.practicalDescription`,
        value: `${tubeItem.practicalDescription} ${locale}`,
      }
    );
  });
}
