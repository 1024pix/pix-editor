import { saveInAirtable } from './utils.js';

// 1 acquis workbench par tube
// + les niveaux impairs : un acquis version 1 périmé + acquis version 2 archivé
// + les niveaux pairs : un acquis version 1 actif + acquis version 2 proposé
export async function buildSkills({
  airtableClient,
  databaseBuilder: _,
  logger,
  learningContentConfig,
  learningContentData,
}) {
  const skillData = [];
  for (let i = 0; i < learningContentConfig.countFrameworks; ++i) {
    for (let j = 0; j < learningContentConfig.countAreasPerFramework; ++j) {
      for (let k = 0; k < learningContentConfig.countCompetencesPerArea; ++k) {
        for (let l = 0; l < learningContentConfig.countThematicsPerCompetence; ++l) {
          for (let m = 0; m < learningContentConfig.countTubesPerThematic; ++m) {
            const currentTubeItem = learningContentData[i].areas[j].competences[k].thematics[l].tubes[m];
            for (let n = 0; n < learningContentConfig.skillMaxLevel; ++n) {
              const baseSkillId = `skillF${i}A${j}C${k}Th${l}Tu${m}S${n}`;
              if (n % 2 === 0) {
                const { activeSkillV1, enConstructionSkillV2 } = buildActiveAndEnConstructionSkills(currentTubeItem, baseSkillId, n);
                skillData.push(activeSkillV1);
                skillData.push(enConstructionSkillV2);
                currentTubeItem.skills.push(activeSkillV1);
                currentTubeItem.skills.push(enConstructionSkillV2);
              } else {
                const { obsoleteSkillV1, archivedSkillV2 } = buildObsoleteAndArchivedSkills(currentTubeItem, baseSkillId, n);
                skillData.push(obsoleteSkillV1);
                skillData.push(archivedSkillV2);
                currentTubeItem.skills.push(obsoleteSkillV1);
                currentTubeItem.skills.push(archivedSkillV2);
              }
            }
          }
        }
        const currentWorkbenchTubeItem = learningContentData[i].areas[j].competences[k].thematics.at(-1).tubes.at(-1);
        const workbenchSkillItem = buildWorkbenchSkill(currentWorkbenchTubeItem, `skillF${i}A${j}C${k}ThWTuWSW`);
        skillData.push(workbenchSkillItem);
        currentWorkbenchTubeItem.skills.push(workbenchSkillItem);
      }
    }
  }
  const airtableData = skillData.map(toAirtableObject);

  const records = await saveInAirtable({ tableName: 'Acquis', data: airtableData, logger, airtableClient });

  skillData.forEach((skillItem) => {
    skillItem.airtableId = records.shift().id;
    skillItem.challenges = [];
  });
}

function toAirtableObject(item) {
  return {
    fields: {
      'id persistant': item.id,
      'Statut de l\'indice': item.hintStatus,
      'Comprendre': [],
      'En savoir plus': [],
      'Status': item.status,
      'Tube': [item.tubeAirtableId],
      'Description': item.description,
      'Level': item.level,
      'Internationalisation': item.internationalisation,
      'Version': item.version,
    }
  };
}

function buildWorkbenchSkill(currentTubeItem, skillId) {
  return {
    id: skillId,
    level: null,
    hintStatus:null,
    description: 'Acquis workbench',
    status: 'en construction',
    internationalisation: null,
    version: null,
    tubeAirtableId: currentTubeItem.airtableId,
  };
}

function buildObsoleteAndArchivedSkills(currentTubeItem, baseSkillId, levelMinusOne) {
  const obsoleteSkillV1 = {
    id: `${baseSkillId}P`,
    level: levelMinusOne + 1,
    hintStatus: 'Validé',
    description: `${baseSkillId}P description`,
    status: 'périmé',
    internationalisation: 'Monde',
    version: 1,
    tubeAirtableId: currentTubeItem.airtableId,
  };
  const archivedSkillV2 = {
    id: `${baseSkillId}A`,
    level: levelMinusOne + 1,
    hintStatus: 'archivé',
    description: `${baseSkillId}A description`,
    status: 'archivé',
    internationalisation: 'France',
    version: 2,
    tubeAirtableId: currentTubeItem.airtableId,
  };
  return { obsoleteSkillV1, archivedSkillV2 };
}

function buildActiveAndEnConstructionSkills(currentTubeItem, baseSkillId, levelMinusOne) {
  const activeSkillV1 = {
    id: `${baseSkillId}V`,
    level: levelMinusOne + 1,
    hintStatus: 'à retravailler',
    description: `${baseSkillId}V description`,
    status: 'actif',
    internationalisation: 'Monde',
    version: 1,
    tubeAirtableId: currentTubeItem.airtableId,
  };
  const enConstructionSkillV2 = {
    id: `${baseSkillId}W`,
    level: levelMinusOne + 1,
    hintStatus: 'Proposé',
    description: `${baseSkillId}W description`,
    status: 'en construction',
    internationalisation: 'France',
    version: 2,
    tubeAirtableId: currentTubeItem.airtableId,
  };
  return { activeSkillV1, enConstructionSkillV2 };
}
