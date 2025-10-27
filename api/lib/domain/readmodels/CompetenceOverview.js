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

  static buildForChallengesProduction({ competence, thematics, tubes, skills, challenges, locale }) {
    let id = `${competence.id}:challenges-production`;
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
            skills,
            challenges,
            locale,
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

  static buildForChallengesProduction({ thematic, tubes, skills, challenges, locale }) {
    const tubesById = Object.fromEntries(tubes.map((tube) => [tube.id, tube]));

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

  static buildForChallengesProduction({ tube, skills, challenges, locale }) {
    const skillsByTubeIdAndLevel = arrangeSkillsByTubeIdAndLevel(skills);

    return new TubeOverview({
      airtableId: tube.airtableId,
      name: tube.name,
      skillOverviews: skillsByTubeIdAndLevel[tube.id]?.map((skills) =>
        SkillOverview.buildForChallengesProduction({
          skill: skills?.[0],
          challenges,
          locale,
        }),
      ),
    });
  }

  static buildForChallengesWorkbench({ tube, skills, challenges }) {
    const skillsByTubeIdAndLevel = arrangeSkillsByTubeIdAndLevel(skills);

    return new TubeOverview({
      airtableId: tube.airtableId,
      name: tube.name,
      skillOverviews: skillsByTubeIdAndLevel[tube.id]?.map((skills) =>
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

function arrangeSkillsByTubeIdAndLevel(skills) {
  const skillsByTubeIdAndLevel = {};

  for (const skill of skills) {
    if (!skillsByTubeIdAndLevel[skill.tubeId]) {
      skillsByTubeIdAndLevel[skill.tubeId] = new Array(7).fill(null);
    }
    if (!skillsByTubeIdAndLevel[skill.tubeId][skill.level - 1]) {
      skillsByTubeIdAndLevel[skill.tubeId][skill.level - 1] = [];
    }
    skillsByTubeIdAndLevel[skill.tubeId][skill.level - 1].push(skill);
  }

  return skillsByTubeIdAndLevel;
}

function isProductionPrototypeOf(skill) {
  return (challenge) => {
    return (
      challenge.skillId === skill.id &&
      challenge.genealogy === Challenge.GENEALOGIES.PROTOTYPE &&
      challenge.status === Challenge.STATUSES.VALIDE
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
