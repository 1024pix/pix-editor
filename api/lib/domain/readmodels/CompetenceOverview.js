import { Challenge, LocalizedChallenge } from '../models/index.js';

export class CompetenceOverview {
  constructor({
    id,
    thematicOverviews,
  }) {
    this.id = id;
    this.thematicOverviews = thematicOverviews;
  }

  static buildForChallengesProduction({ competenceId, thematics, tubes, skills, challenges, locale }) {
    return new CompetenceOverview({
      id: `${competenceId}-challenges-production-fr`,
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

    const prototype = challenges.find(isProductionPrototypeOf(skill));
    let skillChallenges = challenges.filter(challengeBelongsTo(prototype));

    if (locale) {
      skillChallenges = skillChallenges.reduce(filterChallengeByLocale(locale), []);
    }

    return new SkillOverview({
      airtableId: skill.airtableId,
      name: skill.name,
      prototypeId: prototype?.id,
      isPrototypeDeclinable: prototype?.isDeclinable,
      proposedChallengesCount: countByStatus(skillChallenges, Challenge.STATUSES.PROPOSE),
      validatedChallengesCount: countByStatus(skillChallenges, Challenge.STATUSES.VALIDE),
    });
  }
}

function filterChallengeByLocale(locale) {
  return (filteredChallenges, challenge) => {
    if (challenge.locales.includes(locale)) filteredChallenges.push({
      status: challenge.status,
    });
    if (challenge.alternativeLocales.includes(locale)) {
      const localizedChallengeStatus = challenge.localizedChallenges.find((localizedChallenge) => localizedChallenge.locale === locale).status;
      filteredChallenges.push({
        status: computedChallengeAndLocalizedStatuses(challenge.status, localizedChallengeStatus),
      });
    }
    return filteredChallenges;
  };
}

function computedChallengeAndLocalizedStatuses(challengeStatus, localizedChallengeStatus) {
  if (challengeStatus === Challenge.STATUSES.PROPOSE) return Challenge.STATUSES.PROPOSE;
  return localizedChallengeStatus !== LocalizedChallenge.STATUSES.PLAY ? Challenge.STATUSES.PROPOSE : Challenge.STATUSES.VALIDE;
}

function byIndex({ index: index1 }, { index: index2 }) {
  return index1 - index2;
}

function arrangeSkillsByTubeIdAndLevel(skills) {
  const skillsByTubeIdAndLevel = [];

  for (const skill of skills) {
    if (!skillsByTubeIdAndLevel[skill.tubeId]) {
      skillsByTubeIdAndLevel[skill.tubeId] = Array.from({ length:7 }, () => null);
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

function challengeBelongsTo({ skillId, version } = {}) {
  return (challenge) => challenge.skillId === skillId && challenge.version === version;
}

function countByStatus(items, status) {
  return items.reduce((count, item) => item.status === status ? count + 1 : count, 0);
}
