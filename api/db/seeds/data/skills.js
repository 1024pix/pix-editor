import { cycle, saveInAirtable } from './utils.js';
import { Skill } from '../../../lib/domain/models/index.js';

const ignoreEmptyValues = (val) => Boolean(val);

const iterFor = {
  hintStatus: cycle(Object.values(Skill.HINT_STATUSES).filter(ignoreEmptyValues)),
  descriptionStatus: cycle(Object.values(Skill.DESCRIPTION_STATUSES).filter(ignoreEmptyValues)),
};

function* cycleTutorials(tutotialItems) {
  const iter = cycle(tutotialItems);
  while (true) {
    yield [];
    yield [iter.next().value];
    yield [iter.next().value, iter.next().value];
  }
}

export async function buildSkillsFromConfig({
  airtableClient,
  databaseBuilder,
  logger,
  learningContentConfig,
  learningContentData,
  tutorialItems,
}) {
  const skillItems = [];
  const allTubes = learningContentData.flatMap((framework) => framework.areas.flatMap((area) => area.competences).flatMap((competence) => competence.thematics.flatMap((thematic) => thematic.tubes)));
  const tutorialsIter = cycleTutorials(tutorialItems);
  for (const tubeItem of allTubes) {
    if (tubeItem.name.includes('workbench')) {
      const workbenchSkillItem = buildSkill({ tubeItem, isWorkbench: true, databaseBuilder, locales: learningContentConfig.locales });
      skillItems.push(workbenchSkillItem);
      tubeItem.skills.push(workbenchSkillItem);
    } else {
      for (let i = 0; i < learningContentConfig.skillMaxLevel; ++i) {
        if (i % 2 === 0) {
          const activeSkillV1 = buildSkill({ indexSkill: i, suffix: 'Act', tubeItem, status: 'actif', version: 1, isWorkbench: false, databaseBuilder, locales: learningContentConfig.locales, tutorialItems: tutorialsIter.next().value, learningMoreTutorialItems: tutorialsIter.next().value });
          const enConstructionSkillV2 = buildSkill({ indexSkill: i, suffix: 'EnCons', tubeItem, status: 'en construction', version: 2, isWorkbench: false, databaseBuilder, locales: learningContentConfig.locales, tutorialItems: tutorialsIter.next().value, learningMoreTutorialItems: tutorialsIter.next().value });
          skillItems.push(activeSkillV1);
          skillItems.push(enConstructionSkillV2);
          tubeItem.skills.push(activeSkillV1);
          tubeItem.skills.push(enConstructionSkillV2);
        } else {
          const obsoleteSkillV1 = buildSkill({ indexSkill: i, suffix: 'Obs', tubeItem, status: 'périmé', version: 1, isWorkbench: false, databaseBuilder, locales: learningContentConfig.locales, tutorialItems: tutorialsIter.next().value, learningMoreTutorialItems: tutorialsIter.next().value });
          const archivedSkillV2 = buildSkill({ indexSkill: i, suffix: 'Arch', tubeItem, status: 'archivé', version: 2, isWorkbench: false, databaseBuilder, locales: learningContentConfig.locales, tutorialItems: tutorialsIter.next().value, learningMoreTutorialItems: tutorialsIter.next().value });
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
      'Comprendre': item.tutorialAirtableIds,
      'En savoir plus': item.learningMoreTutorialAirtableIds,
    }
  };
}

export function buildSkill({ indexSkill, suffix = '', tubeItem, status, version, isWorkbench, databaseBuilder, locales, tutorialItems, learningMoreTutorialItems }) {
  const partId = tubeItem.id.split('tube')[1];
  const skillId = `skill${partId}S${isWorkbench ? 'W' : indexSkill.toString() + suffix}`;
  const skillItem = {
    id: skillId,
    level: isWorkbench ? null : indexSkill + 1,
    hintStatus: isWorkbench ? null : iterFor.hintStatus.next().value,
    hint: isWorkbench ? null : `${skillId} indice`,
    description: isWorkbench ? 'Acquis workbench' : `${skillId} description`,
    descriptionStatus: isWorkbench ? null : iterFor.descriptionStatus.next().value,
    status: isWorkbench ? 'en construction' : status,
    internationalisation: isWorkbench ? null : 'Monde',
    version: isWorkbench ? null : version,
    tubeAirtableId: tubeItem.airtableId,
    tubeId: tubeItem.id,
    tutorialAirtableIds: tutorialItems?.map(({ airtableId }) => airtableId),
    tutorialIds: tutorialItems?.map(({ id }) => id),
    learningMoreTutorialAirtableIds: learningMoreTutorialItems?.map(({ airtableId }) => airtableId),
    learningMoreTutorialIds: learningMoreTutorialItems?.map(({ id }) => id),
  };
  databaseBuilder.factory.buildSkill(skillItem);
  locales.forEach((locale) => {
    databaseBuilder.factory.buildTranslation(
      {
        locale,
        key: `skill.${skillItem.id}.hint`,
        value: `${skillItem.hint} ${locale}`,
      }
    );
  });
  return skillItem;
}

export async function persistSkills({ items, airtableClient, logger }) {
  const airtableItems = items.map(toAirtableObject);
  const records = await saveInAirtable({ tableName: 'Acquis', data: airtableItems, logger, airtableClient });
  items.forEach((item) => {
    item.airtableId = records.shift().id;
  });
}

export async function copySkillsFromAirtable({ airtableClient, databaseBuilder, logger }) {
  const airtableSkills = await  airtableClient.table('Acquis').select({ fields: [
    'id persistant',
    'Statut de l\'indice',
    'Comprendre (id persistant)',
    'En savoir plus (id persistant)',
    'Status',
    'Tube (id persistant)',
    'Description',
    'Level',
    'Internationalisation',
    'Version',
    'Statut de la description',
  ] }).all();

  logger.info(`Copying ${airtableSkills.length} skills from airtable...`);

  airtableSkills.forEach((record) => {
    databaseBuilder.factory.buildSkill({
      id: record.get('id persistant'),
      hintStatus: record.get('Statut de l\'indice'),
      status: record.get('Status'),
      tubeId: record.get('Tube (id persistant)')[0],
      description: record.get('Description'),
      level: record.get('Level'),
      internationalisation: record.get('Internationalisation'),
      version: record.get('Version'),
      descriptionStatus: record.get('Statut de la description'),
      tutorialIds: record.get('Comprendre (id persistant)'),
      learningMoreTutorialIds: record.get('En savoir plus (id persistant)'),
      createdAt: record._rawJson.createdTime,
      updatedAt: new Date(),
    });
  });
}
