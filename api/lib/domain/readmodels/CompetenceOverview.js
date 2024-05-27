import _ from 'lodash';
import { Challenge } from '../models/index.js';

export class CompetenceOverview {
  constructor({
    id,
    name,
    locale,
    thematicOverviews,
  }) {
    this.id = id;
    this.name = name;
    this.locale = locale;
    this.thematicOverviews = thematicOverviews;
  }

  static build({ locale, competence, thematicsForCompetence, tubesForCompetence, skillsForCompetence, challengesForCompetence, tutorialsForCompetence }) {
    const thematicOverviews = [];
    for (const thematic of thematicsForCompetence) {
      if (thematic.isWorkbench) continue;
      const tubesForThematic = tubesForCompetence.filter((tu) => thematic.tubeIds.includes(tu.id));
      const tubeOverviews = [];
      for (const tube of tubesForThematic) {
        const skillsForTube = skillsForCompetence.filter((sk) => sk.tubeId === tube.id);
        tubeOverviews.push(new TubeOverview({
          id: tube.id,
          name: tube.name,
          enConstructionSkillViews: CompetenceOverview.#buildEnConstructionSkillViews({ locale, skills: skillsForTube, tutorials: tutorialsForCompetence }),
          enProductionSkillViews: CompetenceOverview.#buildEnProductionSkillViews2({ locale, skills: skillsForTube, challenges: challengesForCompetence, tutorials: tutorialsForCompetence }),
          atelierSkillViews: CompetenceOverview.#buildAtelierSkillViews({ locale, skills: skillsForTube, challenges: challengesForCompetence }),
        }));
      }
      thematicOverviews.push(new ThematicOverview({
        id: thematic.id,
        name: thematic.name_i18n['fr'],
        tubeOverviews,
      }));
    }
    return new CompetenceOverview({
      id: competence.id,
      name: competence.name_i18n['fr'],
      locale,
      thematicOverviews,
    });
  }

  static #buildEnConstructionSkillViews({ locale, skills, tutorials }) {
    const enConstructionSkills = _
      .chain(skills)
      .filter((skill) => skill.isEnConstruction)
      .groupBy('name')
      .map((skills) => skills
        .sort((skA, skB) => skB.version || 0 - skA.version || 0)[0])
      .value();
    const enConstructionSkillViews = [];

    for (const enConstructionSkill of enConstructionSkills) {
      const tutorialsCount = tutorials.filter((tu) => enConstructionSkill.tutorialIds.includes(tu.id) && tu.locale.startsWith(locale)).length;
      const learningMoreTutorialsCount = tutorials.filter((tu) => enConstructionSkill.learningMoreTutorialIds.includes(tu.id) && tu.locale.startsWith(locale)).length;
      enConstructionSkillViews.push(new EnConstructionSkillView({
        id: enConstructionSkill.id,
        name: enConstructionSkill.name,
        level: enConstructionSkill.level,
        hintStatus: enConstructionSkill.hintStatus,
        tutorialsCount,
        learningMoreTutorialsCount,
      }));
    }
    return enConstructionSkillViews;
  }

  static #buildEnProductionSkillViews2({ locale, skills, tutorials, challenges }) {
    const activeSkills = skills.filter((sk) => sk.isActif);
    return activeSkills.map((skill) => {
      const validePrototype = challenges.find((ch) => ch.skillId === skill.id && ch.isPrototype && ch.isValide);
      const challengesForSkill = challenges.filter((ch) => ch.skillId === skill.id && ch.version === validePrototype.version && (ch.isValide || ch.isPropose));
      const validatedChallengesCount = challengesForSkill
        .filter((challenge) => challenge.isValide)
        .filter((challenge) => {
          if (challenge.locales.some((challengeLocale) => challengeLocale.startsWith(locale))) return true;
          for (const localizedChallenge of challenge.localizedChallenges) {
            if (localizedChallenge.isValide && localizedChallenge.locale.startsWith(locale)) return true;
          }
          return false;
        }).length;

      const proposedChallengesCount = challengesForSkill
        .filter((challenge) => challenge.isValide || challenge.isPropose)
        .filter((challenge) => {
          if (challenge.isPropose && challenge.locales.some((challengeLocale) => challengeLocale.startsWith(locale))) return true;
          if (challenge.isValide) {
            for (const localizedChallenge of challenge.localizedChallenges) {
              if (localizedChallenge.isPropose && localizedChallenge.locale.startsWith(locale)) return true;
            }
          }
          return false;
        });

      return new EnProductionSkillView({
        id: skill.id,
        name: skill.name,
        level: skill.level,
        hintStatus: skill.hintStatus,
        status: skill.status,
        prototypeId: validePrototype.id,
        isProtoDeclinable: validePrototype.isDeclinable,
        validatedChallengesCount,
        proposedChallengesCount: proposedChallengesCount.length,
        tutorialsCount: tutorials.filter((tu) => skill.tutorialIds.includes(tu.id) && tu.locale.startsWith(locale)).length,
        learningMoreTutorialsCount: tutorials.filter((tu) => skill.learningMoreTutorialIds.includes(tu.id) && tu.locale.startsWith(locale)).length,
      });
    });
  }

  static #buildAtelierSkillViews({ skills, challenges }) {
    const skillsByName = _.groupBy(skills, 'name');
    const atelierSkillViews = [];
    for (const skillsForName of Object.values(skillsByName)) {
      const atelierSkillVersionViews = skillsForName.map((sk) => {
        const prototypesForSkill = challenges.filter((ch) => ch.skillId === sk.id && ch.genealogy === Challenge.GENEALOGIES.PROTOTYPE);
        return new AtelierSkillVersionView({
          id: sk.id,
          status: sk.status,
          validatedPrototypesCount: prototypesForSkill.filter((proto) => proto.status === Challenge.STATUSES.VALIDE).length,
          proposedPrototypesCount: prototypesForSkill.filter((proto) => proto.status === Challenge.STATUSES.PROPOSE).length,
          archivedPrototypesCount: prototypesForSkill.filter((proto) => proto.status === Challenge.STATUSES.ARCHIVE).length,
          obsoletePrototypesCount: prototypesForSkill.filter((proto) => proto.status === Challenge.STATUSES.PERIME).length,
        });
      });
      atelierSkillViews.push(new AtelierSkillView({
        name: skillsForName[0].name,
        level: skillsForName[0].level,
        atelierSkillVersionViews,
      }));
    }
    return atelierSkillViews;
  }
}

export class ThematicOverview {
  constructor({
    id,
    name,
    tubeOverviews,
  }) {
    this.id = id;
    this.name = name;
    this.tubeOverviews = tubeOverviews;
  }
}

export class TubeOverview {
  constructor({
    id,
    name,
    enConstructionSkillViews,
    atelierSkillViews,
    enProductionSkillViews,
  }) {
    this.id = id;
    this.name = name;
    this.enConstructionSkillViews = enConstructionSkillViews;
    this.atelierSkillViews = atelierSkillViews;
    this.enProductionSkillViews = enProductionSkillViews;
  }
}

export class EnConstructionSkillView {
  constructor({
    id,
    name,
    level,
    hintStatus,
    tutorialsCount,
    learningMoreTutorialsCount,
  }) {
    this.id = id;
    this.name = name;
    this.level = level;
    this.hintStatus = hintStatus;
    this.tutorialsCount = tutorialsCount;
    this.learningMoreTutorialsCount = learningMoreTutorialsCount;
  }
}

export class AtelierSkillView {
  constructor({
    name,
    level,
    atelierSkillVersionViews,
  }) {
    this.id = name;
    this.name = name;
    this.level = level;
    this.atelierSkillVersionViews = atelierSkillVersionViews;
  }
}

export class AtelierSkillVersionView {
  constructor({
    id,
    status,
    validatedPrototypesCount,
    proposedPrototypesCount,
    archivedPrototypesCount,
    obsoletePrototypesCount,
  }) {
    this.id = id;
    this.status = status;
    this.validatedPrototypesCount = validatedPrototypesCount;
    this.proposedPrototypesCount = proposedPrototypesCount;
    this.archivedPrototypesCount = archivedPrototypesCount;
    this.obsoletePrototypesCount = obsoletePrototypesCount;
  }
}

export class EnProductionSkillView {
  constructor({
    id,
    name,
    level,
    status,
    hintStatus,
    prototypeId,
    isProtoDeclinable,
    validatedChallengesCount,
    proposedChallengesCount,
    tutorialsCount,
    learningMoreTutorialsCount,
  }) {
    this.id = id;
    this.name = name;
    this.level = level;
    this.status = status;
    this.hintStatus = hintStatus;
    this.prototypeId = prototypeId;
    this.isProtoDeclinable = isProtoDeclinable;
    this.validatedChallengesCount = validatedChallengesCount;
    this.proposedChallengesCount = proposedChallengesCount;
    this.tutorialsCount = tutorialsCount;
    this.learningMoreTutorialsCount = learningMoreTutorialsCount;
  }
}
