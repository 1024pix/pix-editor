import { Challenge } from '../models/index.js';

export class CompetenceOverview {
  constructor({
    id,
    thematicOverviews,
  }) {
    this.id = id;
    this.thematicOverviews = thematicOverviews;
  }

  static buildForChallengesProduction({ competenceId, thematics, tubes, skills, challenges, locale }) {
    let id = `${competenceId}:challenges-production`;
    if (locale) id += `:${locale}`;
    return new CompetenceOverview({
      id,
      thematicOverviews: thematics
        .sort(byIndex)
        .map((thematic) => ThematicOverview.buildForChallengesProduction({ thematic, tubes, skills, challenges, locale }))
        .filter((thematicOverview) => !thematicOverview.isEmpty),
    });
  }
}

class ThematicOverview {
  constructor({
    airtableId,
    name,
    tubeOverviews,
  }) {
    this.airtableId = airtableId;
    this.name = name;
    this.tubeOverviews = tubeOverviews;
  }

  static buildForChallengesProduction({ thematic, tubes, skills, challenges, locale }) {
    const tubesById = Object.fromEntries(tubes.map((tube) => [tube.id, tube]));

    return new ThematicOverview({
      airtableId: thematic.airtableId,
      name: thematic.name_i18n.fr,
      tubeOverviews: thematic.tubeIds
        ?.map((tubeId) => tubesById[tubeId])
        .sort(byIndex)
        .map((tube) => TubeOverview.buildForChallengesProduction({ tube, skills, challenges, locale }))
        .filter((tubeOverview) => !tubeOverview.isEmpty)
    });
  }

  get isEmpty() {
    return !this.tubeOverviews || this.tubeOverviews.length === 0;
  }
}

class TubeOverview {
  constructor({
    airtableId,
    name,
    skillOverviews,
  }) {
    this.airtableId = airtableId;
    this.name = name;
    this.skillOverviews = skillOverviews;
  }

  static buildForChallengesProduction({ tube, skills, challenges, locale }) {
    const skillsByTubeIdAndLevel = arrangeSkillsByTubeIdAndLevel(skills);

    return new TubeOverview({
      airtableId: tube.airtableId,
      name: tube.name,
      skillOverviews: skillsByTubeIdAndLevel[tube.id]
        ?.map((skill) => SkillOverview.buildForChallengesProduction({ skill, challenges, locale })),
    });
  }

  get isEmpty() {
    return !this.skillOverviews || this.skillOverviews.length === 0;
  }
}

class SkillOverview {
  constructor({
    airtableId,
    name,
    prototypeId,
    isPrototypeDeclinable,
    proposedChallengesCount,
    validatedChallengesCount,
  }) {
    this.airtableId = airtableId;
    this.name = name;
    this.prototypeId = prototypeId;
    this.isPrototypeDeclinable = isPrototypeDeclinable;
    this.proposedChallengesCount = proposedChallengesCount;
    this.validatedChallengesCount = validatedChallengesCount;
  }

  static buildForChallengesProduction({ skill, challenges, locale }) {
    if (!skill) return null;

    const productionPrototype = challenges.find(isProductionPrototypeOf(skill));

    const productionChallenges = challenges.filter(hasSkillIdAndVersionOf(productionPrototype));

    return new SkillOverview({
      airtableId: skill.airtableId,
      name: skill.name,
      prototypeId: productionPrototype?.id,
      isPrototypeDeclinable: productionPrototype?.isDeclinable,
      proposedChallengesCount: countChallengesByStatusAndLocale(productionChallenges, Challenge.STATUSES.PROPOSE, locale),
      validatedChallengesCount: countChallengesByStatusAndLocale(productionChallenges, Challenge.STATUSES.VALIDE, locale),
    });
  }
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
    skillsByTubeIdAndLevel[skill.tubeId][skill.level - 1] = skill;
  }

  return skillsByTubeIdAndLevel;
}

function isProductionPrototypeOf(skill) {
  return (challenge) => {
    return challenge.skillId === skill.id
      && challenge.genealogy === Challenge.GENEALOGIES.PROTOTYPE
      && challenge.status === Challenge.STATUSES.VALIDE;
  };
}

function hasSkillIdAndVersionOf({ skillId, version } = {}) {
  return (challenge) => challenge.skillId === skillId && challenge.version === version;
}

function countChallengesByStatusAndLocale(challenges, status, locale) {
  return challenges.reduce((count, challenge) => {
    const localeChallenge = getChallengeForLocale(challenge, locale);

    if (!localeChallenge) return count;

    return localeChallenge.status === status ? count + 1 : count;
  }, 0);
}

function getChallengeForLocale(challenge, locale) {
  if (!locale) return challenge;
  if (challenge.locales.includes(locale)) return challenge;
  if (challenge.alternativeLocales.includes(locale)) return challenge.translate(locale);
  return undefined;
}
