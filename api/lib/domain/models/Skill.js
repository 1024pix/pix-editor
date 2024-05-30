import { Challenge } from './Challenge.js';

export class Skill {
  constructor({
    id,
    name,
    description,
    hint_i18n,
    hintStatus,
    tutorialIds,
    learningMoreTutorialIds,
    pixValue,
    competenceId,
    internationalisation,
    status,
    tubeId,
    version,
    level,
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.hint_i18n = hint_i18n;
    this.hintStatus = hintStatus;
    this.tutorialIds = tutorialIds;
    this.learningMoreTutorialIds = learningMoreTutorialIds;
    this.pixValue = pixValue;
    this.competenceId = competenceId;
    this.status = status;
    this.tubeId = tubeId;
    this.version = version;
    this.level = level;
    this.internationalisation = internationalisation;
  }

  static get STATUSES() {
    return {
      ACTIF: 'actif',
      EN_CONSTRUCTION: 'en construction',
      ARCHIVE: 'archivé',
      PERIME: 'périmé',
    };
  }

  static get ID_PREFIX() {
    return 'skill';
  }

  get isLive() {
    return [Skill.STATUSES.EN_CONSTRUCTION, Skill.STATUSES.ACTIF].includes(this.status);
  }

  cloneSkillAndChallenges({ tubeDestination, level, skillChallenges, tubeSkills, attachments, generateNewIdFnc }) {
    const version = tubeSkills.filter((sk) => sk.level === level).length + 1;
    const name = `${tubeDestination.name}${level}`;
    const id = generateNewIdFnc(Skill.ID_PREFIX);
    const liveChallenges = skillChallenges.filter((ch) => [Challenge.STATUSES.PROPOSE, Challenge.STATUSES.VALIDE].includes(ch.status));
    const prototypesWithActiveFirst = liveChallenges
      .filter((ch) => ch.genealogy === 'Prototype 1')
      .sort((chA, chB) => {
        if (chA.status === Challenge.STATUSES.VALIDE) return -1;
        if (chB.status === Challenge.STATUSES.VALIDE) return 1;
        return 0;
      });
    const clonedChallenges = [];
    const clonedAttachments = [];
    let prototypeVersion = 1;
    for (const prototype of prototypesWithActiveFirst) {
      const { clonedChallenge: cloneProto, clonedAttachments: cloneAttachmentsProto } = prototype.cloneChallengeAndAttachments({
        skillId: id,
        competenceId: tubeDestination.competenceId,
        generateNewIdFnc,
        prototypeVersion,
        alternativeVersion: null,
        attachments,
      });
      clonedChallenges.push(cloneProto);
      clonedAttachments.push(...cloneAttachmentsProto);
      const declinaisons = liveChallenges.filter((ch) => ch.genealogy === 'Décliné 1' && ch.version === prototype.version);
      let alternativeVersion = 1;
      for (const declinaison of declinaisons) {
        const { clonedChallenge: cloneDecli, clonedAttachments: cloneAttachmentsDecli } = declinaison.cloneChallengeAndAttachments({
          skillId: id,
          competenceId: tubeDestination.competenceId,
          generateNewIdFnc,
          prototypeVersion,
          alternativeVersion: alternativeVersion,
          attachments,
        });
        clonedChallenges.push(cloneDecli);
        clonedAttachments.push(...cloneAttachmentsDecli);
        ++alternativeVersion;
      }
      ++prototypeVersion;
    }
    const clonedSkill = new Skill({
      id,
      version,
      name,
      level,
      tubeId: tubeDestination.id,
      competenceId: tubeDestination.competenceId,
      status: Skill.STATUSES.EN_CONSTRUCTION,
      description: this.description,
      hint_i18n: this.hint_i18n,
      hintStatus: this.hintStatus,
      tutorialIds: this.tutorialIds,
      learningMoreTutorialIds: this.learningMoreTutorialIds,
      internationalisation: this.internationalisation,
    });
    return {
      clonedSkill,
      clonedChallenges,
      clonedAttachments,
    };
  }
}
