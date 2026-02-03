import { Challenge } from '../models/index.js';

export class CompetenceOverview {
  constructor({ id, airtableId, name, thematicOverviews }) {
    this.id = id;
    this.airtableId = airtableId;
    this.name = name;
    this.thematicOverviews = thematicOverviews;
    this.tubesCount = sumBy(thematicOverviews, ({ tubesCount }) => tubesCount);
    this.skillsCount = sumBy(thematicOverviews, ({ skillsCount }) => skillsCount);
  }

  static buildForChallengesProduction({ competence, thematics, tubes, skills, challenges, locale, localizedFrameworkTubes }) {
    let id = `${competence.id}:challenges-production`;
    const challengesIdWithQualityOk = challenges.filter(({ isQualityOk }) => isQualityOk).map(({ id }) => id);
    const skillsFilterByChallengeWithQualityOk = skills.filter(
      ({ challengeIds }) => {
        const challengesWithQualityCheck = challengeIds.filter((c) => challengesIdWithQualityOk.indexOf(c) !== -1);
        return challengesWithQualityCheck.length > 0;
      });
    if (locale) id += `:${locale}`;
    return new CompetenceOverview({
      id,
      airtableId: competence.airtableId,
      name: `${competence.index} ${competence.name_i18n['fr']}`,
      thematicOverviews: thematics
        .sort(byIndex)
        .map((thematic) =>
          ThematicOverview.buildForChallengesProduction({
            thematic,
            tubes,
            skills: skillsFilterByChallengeWithQualityOk,
            challenges,
            locale,
            localizedFrameworkTubes,
          }),
        )
        .filter((thematicOverview) => !thematicOverview.isEmpty),
    });
  }

  static buildForChallengesWorkbench({ competence, thematics, tubes, skills, challenges }) {
    const id = `${competence.id}:challenges-workbench`;
    const skillsWithoutWorkbench = skills.filter(({ name }) => name !== '@workbench');
    return new CompetenceOverview({
      id,
      airtableId: competence.airtableId,
      name: `${competence.index} ${competence.name_i18n['fr']}`,
      thematicOverviews: thematics
        .sort(byIndex)
        .map((thematic) =>
          ThematicOverview.buildForChallengesWorkbench({
            thematic,
            tubes,
            skills: skillsWithoutWorkbench,
            challenges,
          }),
        )
        .filter((thematicOverview) => !thematicOverview.isEmpty),
    });
  }
}

class ThematicOverview {
  constructor({ airtableId, name, tubeOverviews }) {
    this.airtableId = airtableId;
    this.name = name;
    this.tubeOverviews = tubeOverviews;
  }

  get isEmpty() {
    return !this.tubeOverviews || this.tubeOverviews.length === 0;
  }

  get tubesCount() {
    return this.isEmpty ? 0 : this.tubeOverviews.length;
  }

  get skillsCount() {
    return this.isEmpty ? 0 : sumBy(this.tubeOverviews, ({ skillsCount }) => skillsCount);
  }

  static buildForChallengesProduction({ thematic, tubes, skills, challenges, locale, localizedFrameworkTubes }) {
    const tubesById = Object.fromEntries(tubes.map((tube) => [tube.id, tube]));
    const localizedFrameworkTubesById = localizedFrameworkTubes ? Object.fromEntries(localizedFrameworkTubes.map((localizedFrameworkTube) => [localizedFrameworkTube.tubeId, localizedFrameworkTube])) : null;

    return new ThematicOverview({
      airtableId: thematic.airtableId,
      name: thematic.name_i18n.fr,
      tubeOverviews: thematic.tubeIds
        ?.map((tubeId) => tubesById[tubeId])
        .sort(byIndex)
        .map((tube) =>
          TubeOverview.buildForChallengesProduction({
            tube,
            skills,
            challenges,
            locale,
            localizedFrameworkTube: localizedFrameworkTubesById?.[tube.id],
          }),
        )
        .filter((tubeOverview) => !tubeOverview.isEmpty),
    });
  }

  static buildForChallengesWorkbench({ thematic, tubes, skills, challenges }) {
    const tubesById = Object.fromEntries(tubes.map((tube) => [tube.id, tube]));

    return new ThematicOverview({
      airtableId: thematic.airtableId,
      name: thematic.name_i18n.fr,
      tubeOverviews: thematic.tubeIds
        ?.map((tubeId) => tubesById[tubeId])
        .sort(byIndex)
        .map((tube) =>
          TubeOverview.buildForChallengesWorkbench({
            tube,
            skills,
            challenges,
          }),
        )
        .filter((tubeOverview) => !tubeOverview.isEmpty),
    });
  }
}

class TubeOverview {
  constructor({ airtableId, name, skillOverviews }) {
    this.airtableId = airtableId;
    this.name = name;
    this.skillOverviews = skillOverviews;
  }

  get isEmpty() {
    return !this.skillOverviews || this.skillOverviews.length === 0;
  }

  get skillsCount() {
    return this.isEmpty ? 0 : sumBy(this.skillOverviews, (skillOverview) => (skillOverview === null ? 0 : 1));
  }

  static buildForChallengesProduction({ tube, skills, challenges, locale, localizedFrameworkTube }) {
    const tubeSkills = skills.filter((skill) => skill.tubeId === tube.id);
    const localizedFrameworkSkills = TubeOverview.getLocalizedFrameworkSkills({ skills: tubeSkills, locale, localizedFrameworkTube });
    const skillsByLevel = arrangeSkillsByLevel(localizedFrameworkSkills);

    return new TubeOverview({
      airtableId: tube.airtableId,
      name: tube.name,
      skillOverviews: skillsByLevel?.map((skills) =>
        SkillOverview.buildForChallengesProduction({
          skill: skills?.[0],
          challenges,
          locale,
        }),
      ),
    });
  }

  static getLocalizedFrameworkSkills({ skills, locale, localizedFrameworkTube }) {
    if (!locale) return skills;
    if (!localizedFrameworkTube) return [];
    return skills.filter((skill) => skill.level <= localizedFrameworkTube.maxLevel);
  }

  static buildForChallengesWorkbench({ tube, skills, challenges }) {
    const tubeSkills = skills.filter((skill) => skill.tubeId === tube.id);
    const skillsByLevel = arrangeSkillsByLevel(tubeSkills);

    return new TubeOverview({
      airtableId: tube.airtableId,
      name: tube.name,
      skillOverviews: skillsByLevel?.map((skills) =>
        SkillOverview.buildForChallengesWorkbench({ skills, challenges }),
      ),
    });
  }
}

class SkillOverview {
  constructor({
    id,
    airtableId,
    name,
    prototypeId,
    isPrototypeDeclinable,
    proposedChallengesCount,
    validatedChallengesCount,
    archivedChallengesCount,
    obsoleteChallengesCount,
    isPrototypeQualityOk,
    isPrototypeToRephrase,
  }) {
    this.id = id;
    this.airtableId = airtableId;
    this.name = name;
    this.prototypeId = prototypeId;
    this.isPrototypeDeclinable = isPrototypeDeclinable;
    this.proposedChallengesCount = proposedChallengesCount;
    this.validatedChallengesCount = validatedChallengesCount;
    this.archivedChallengesCount = archivedChallengesCount;
    this.obsoleteChallengesCount = obsoleteChallengesCount;
    this.isPrototypeQualityOk = isPrototypeQualityOk;
    this.isPrototypeToRephrase = isPrototypeToRephrase;
  }

  static buildForChallengesProduction({ skill, challenges, locale }) {
    if (!skill) return null;

    const productionPrototype = challenges.find(isProductionPrototypeOf(skill));

    const productionChallenges = challenges.filter(hasSkillIdAndVersionOf(productionPrototype));

    return new SkillOverview({
      id: skill.id,
      airtableId: skill.airtableId,
      name: skill.name,
      prototypeId: productionPrototype?.id,
      isPrototypeDeclinable: productionPrototype?.isDeclinable,
      isPrototypeQualityOk: productionPrototype?.isQualityOk,
      isPrototypeToRephrase: productionPrototype?.primaryLocalizedChallenge?.toRephrase,
      proposedChallengesCount: countChallengesByStatusAndLocale(
        productionChallenges,
        Challenge.STATUSES.PROPOSE,
        locale,
      ),
      validatedChallengesCount: countChallengesByStatusAndLocale(
        productionChallenges,
        Challenge.STATUSES.VALIDE,
        locale,
      ),
    });
  }

  static buildForChallengesWorkbench({ skills, challenges }) {
    if (!skills) return null;

    const latestSkill = getLatestSkill(skills);

    const skillsChallenges = challenges.filter(belongsToOneOf(skills));

    return new SkillOverview({
      airtableId: latestSkill.airtableId,
      name: latestSkill.name,
      proposedChallengesCount: countChallengesByStatus(skillsChallenges, Challenge.STATUSES.PROPOSE),
      validatedChallengesCount: countChallengesByStatus(skillsChallenges, Challenge.STATUSES.VALIDE),
      archivedChallengesCount: countChallengesByStatus(skillsChallenges, Challenge.STATUSES.ARCHIVE),
      obsoleteChallengesCount: countChallengesByStatus(skillsChallenges, Challenge.STATUSES.PERIME),
    });
  }
}

function getLatestSkill(skills) {
  return skills.reduce((skill1, skill2) => {
    return skill1.version < skill2.version ? skill2 : skill1;
  });
}

function byIndex({ index: index1 }, { index: index2 }) {
  return index1 - index2;
}

function arrangeSkillsByLevel(skills) {
  if (skills.length === 0) return null;

  const skillsByLevel = new Array(7).fill(null);

  skills.forEach((skill) => {
    if (!skillsByLevel[skill.level - 1]) {
      skillsByLevel[skill.level - 1] = [];
    }
    skillsByLevel[skill.level - 1].push(skill);
  });

  return skillsByLevel;
}

function isProductionPrototypeOf(skill) {
  return (challenge) => {
    return (
      challenge.skillId === skill.id
      && challenge.genealogy === Challenge.GENEALOGIES.PROTOTYPE
      && challenge.status === Challenge.STATUSES.VALIDE
    );
  };
}

function hasSkillIdAndVersionOf({ skillId, version } = {}) {
  return (challenge) => challenge.skillId === skillId && challenge.version === version;
}

function belongsToOneOf(skills) {
  const skillIds = skills.map((skill) => skill.id);
  return (challenge) => skillIds.includes(challenge.skillId);
}

function countChallengesByStatusAndLocale(challenges, status, locale) {
  return challenges.reduce((count, challenge) => {
    const localeChallenge = getChallengeForLocale(challenge, locale);

    if (!localeChallenge) return count;

    return localeChallenge.status === status ? count + 1 : count;
  }, 0);
}

function countChallengesByStatus(challenges, status) {
  return challenges.reduce((count, challenge) => {
    return challenge.status === status ? count + 1 : count;
  }, 0);
}

function getChallengeForLocale(challenge, locale) {
  if (!locale) return challenge;
  if (challenge.locales.includes(locale)) return challenge;
  if (challenge.alternativeLocales.includes(locale)) return challenge.translate(locale);
  return undefined;
}

function sumBy(items, mapper) {
  return items.reduce((sum, item) => sum + mapper(item), 0);
}
