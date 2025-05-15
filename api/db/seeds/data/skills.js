import { saveInAirtable } from './utils.js';

export async function buildSkillsFromConfig({
  airtableClient,
  databaseBuilder: _,
  logger,
  learningContentConfig,
  learningContentData,
}) {
  const skillItems = [];
  const allTubes = learningContentData.flatMap((framework) => framework.areas.flatMap((area) => area.competences).flatMap((competence) => competence.thematics.flatMap((thematic) => thematic.tubes)));
  for (const tubeItem of allTubes) {
    if (tubeItem.name.includes('workbench')) {
      const workbenchSkillItem = buildSkill({ tubeItem, isWorkbench: true });
      skillItems.push(workbenchSkillItem);
      tubeItem.skills.push(workbenchSkillItem);
    } else {
      for (let i = 0; i < learningContentConfig.skillMaxLevel; ++i) {
        if (i % 2 === 0) {
          const activeSkillV1 = buildSkill({ indexSkill: i, suffix: 'Act', tubeItem, status: 'actif', version: 1, isWorkbench: false });
          const enConstructionSkillV2 = buildSkill({ indexSkill: i, suffix: 'EnCons', tubeItem, status: 'en construction', version: 2, isWorkbench: false });
          skillItems.push(activeSkillV1);
          skillItems.push(enConstructionSkillV2);
          tubeItem.skills.push(activeSkillV1);
          tubeItem.skills.push(enConstructionSkillV2);
        } else {
          const obsoleteSkillV1 = buildSkill({ indexSkill: i, suffix: 'Obs', tubeItem, status: 'périmé', version: 1, isWorkbench: false });
          const archivedSkillV2 = buildSkill({ indexSkill: i, suffix: 'Arch', tubeItem, status: 'archivé', version: 2, isWorkbench: false });
          skillItems.push(obsoleteSkillV1);
          skillItems.push(archivedSkillV2);
          tubeItem.skills.push(obsoleteSkillV1);
          tubeItem.skills.push(archivedSkillV2);
        }
      }
    }
  }
  await persistSkills({ items: skillItems, airtableClient, logger });
  skillItems.forEach((skillItem) => {
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

export function buildSkill({ indexSkill, suffix = '', tubeItem, status, version, isWorkbench }) {
  const partId = tubeItem.id.split('tube')[1];
  const skillId = `skill${partId}S${isWorkbench ? 'W' : indexSkill.toString() + suffix}`;
  return {
    id: skillId,
    level: isWorkbench ? null : indexSkill + 1,
    hintStatus: isWorkbench ? null : 'à retravailler',
    description: isWorkbench ? 'Acquis workbench' : `${skillId} description`,
    status: isWorkbench ? 'en construction' : status,
    internationalisation: isWorkbench ? null : 'Monde',
    version: isWorkbench ? null : version,
    tubeAirtableId: tubeItem.airtableId,
  };
}

export async function persistSkills({ items, airtableClient, logger }) {
  const airtableItems = items.map(toAirtableObject);
  const records = await saveInAirtable({ tableName: 'Acquis', data: airtableItems, logger, airtableClient });
  items.forEach((item) => {
    item.airtableId = records.shift().id;
  });
}
