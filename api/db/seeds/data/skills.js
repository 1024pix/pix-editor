import { cycle } from './utils.js';
import { Skill } from '../../../lib/domain/models/index.js';
import { transformLocalesToUniqLangArray } from './utils.js';

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

export function buildSkillsFromConfig({ databaseBuilder, learningContentConfig, learningContentData, tutorialItems }) {
  const skillItems = [];
  const allTubes = learningContentData.flatMap((framework) =>
    framework.areas
      .flatMap((area) => area.competences)
      .flatMap((competence) => competence.thematics.flatMap((thematic) => thematic.tubes)),
  );
  const tutorialsIter = cycleTutorials(tutorialItems);
  for (const tubeItem of allTubes) {
    if (tubeItem.name.includes('workbench')) {
      const workbenchSkillItem = buildSkill({
        tubeItem,
        isWorkbench: true,
        databaseBuilder,
        locales: learningContentConfig.locales,
      });
      skillItems.push(workbenchSkillItem);
      tubeItem.skills.push(workbenchSkillItem);
    } else {
      for (let i = 0; i < learningContentConfig.skillMaxLevel; ++i) {
        if (i % 2 === 0) {
          const activeSkillV1 = buildSkill({
            indexSkill: i,
            suffix: 'Act',
            tubeItem,
            status: 'actif',
            version: 1,
            isWorkbench: false,
            databaseBuilder,
            locales: learningContentConfig.locales,
            tutorialItems: tutorialsIter.next().value,
            learningMoreTutorialItems: tutorialsIter.next().value,
          });
          const enConstructionSkillV2 = buildSkill({
            indexSkill: i,
            suffix: 'EnCons',
            tubeItem,
            status: 'en construction',
            version: 2,
            isWorkbench: false,
            databaseBuilder,
            locales: learningContentConfig.locales,
            tutorialItems: tutorialsIter.next().value,
            learningMoreTutorialItems: tutorialsIter.next().value,
          });
          skillItems.push(activeSkillV1);
          skillItems.push(enConstructionSkillV2);
          tubeItem.skills.push(activeSkillV1);
          tubeItem.skills.push(enConstructionSkillV2);
        } else {
          const obsoleteSkillV1 = buildSkill({
            indexSkill: i,
            suffix: 'Obs',
            tubeItem,
            status: 'périmé',
            version: 1,
            isWorkbench: false,
            databaseBuilder,
            locales: learningContentConfig.locales,
            tutorialItems: tutorialsIter.next().value,
            learningMoreTutorialItems: tutorialsIter.next().value,
          });
          const archivedSkillV2 = buildSkill({
            indexSkill: i,
            suffix: 'Arch',
            tubeItem,
            status: 'archivé',
            version: 2,
            isWorkbench: false,
            databaseBuilder,
            locales: learningContentConfig.locales,
            tutorialItems: tutorialsIter.next().value,
            learningMoreTutorialItems: tutorialsIter.next().value,
          });
          skillItems.push(obsoleteSkillV1);
          skillItems.push(archivedSkillV2);
          tubeItem.skills.push(obsoleteSkillV1);
          tubeItem.skills.push(archivedSkillV2);
        }
      }
    }
  }
  skillItems.forEach((skillItem) => {
    skillItem.challenges = [];
  });
}

export function buildSkill({
  indexSkill,
  suffix = '',
  tubeItem,
  status,
  version,
  isWorkbench,
  databaseBuilder,
  locales,
  tutorialItems,
  learningMoreTutorialItems,
}) {
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
    tubeId: tubeItem.id,
    tutorialIds: tutorialItems?.map(({ id }) => id),
    learningMoreTutorialIds: learningMoreTutorialItems?.map(({ id }) => id),
  };
  databaseBuilder.factory.buildSkill(skillItem);
  transformLocalesToUniqLangArray(locales)
    .forEach((locale) => {
      databaseBuilder.factory.buildTranslation({
        locale,
        key: `skill.${skillItem.id}.hint`,
        value: `${skillItem.hint} ${locale}`,
      });
    });
  return skillItem;
}
