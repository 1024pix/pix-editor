import { Challenge } from './Challenge.js';

export class Skill {
  constructor({
    id,
    airtableId,
    name,
    description,
    descriptionStatus,
    hint_i18n,
    hintStatus,
    tutorialIds,
    tutorialAirtableIds,
    learningMoreTutorialIds,
    learningMoreTutorialAirtableIds,
    pixValue,
    competenceId,
    internationalisation,
    status,
    tubeId,
    tubeAirtableId,
    version,
    level,
    challengeIds,
    createdAt,
    activatedAt,
    archivedAt,
    obsoletedAt,
  }) {
    this.id = id;
    this.airtableId = airtableId;
    this.name = name;
    this.description = description;
    this.descriptionStatus = descriptionStatus;
    this.hint_i18n = hint_i18n;
    this.hintStatus = hintStatus;
    this.tutorialIds = tutorialIds;
    this.tutorialAirtableIds = tutorialAirtableIds;
    this.learningMoreTutorialIds = learningMoreTutorialIds;
    this.learningMoreTutorialAirtableIds = learningMoreTutorialAirtableIds;
    this.pixValue = pixValue;
    this.competenceId = competenceId;
    this.status = status;
    this.tubeId = tubeId;
    this.tubeAirtableId = tubeAirtableId;
    this.version = version;
    this.level = level;
    this.internationalisation = internationalisation;
    this.challengeIds = challengeIds;
    this.createdAt = createdAt;
    this.activatedAt = activatedAt;
    this.archivedAt = archivedAt;
    this.obsoletedAt = obsoletedAt;
  }

  static get STATUSES() {
    return {
      ACTIF: 'actif',
      EN_CONSTRUCTION: 'en construction',
      ARCHIVE: 'archivé',
      PERIME: 'périmé',
    };
  }

  static get HINT_STATUSES() {
    return {
      PROPOSE: 'Proposé',
      VALIDE: 'Validé',
      PRE_VALIDE: 'pré-validé',
      A_SOUMETTRE: 'à soumettre',
      A_RETRAVAILLER: 'à retravailler',
      ARCHIVE: 'archivé',
      INAPPLICABLE: 'inapplicable',
      NONE: '',
    };
  }

  static get DESCRIPTION_STATUSES() {
    return {
      PROPOSE: 'Proposé',
      VALIDE: 'Validé',
      PRE_VALIDE: 'pré-validé',
      A_SOUMETTRE: 'à soumettre',
      A_RETRAVAILLER: 'à retravailler',
      ARCHIVE: 'archivé',
      NONE: '',
    };
  }

  static get INTERNATIONALISATIONS() {
    return {
      MONDE: 'Monde',
      FRANCE: 'France',
      UNION_EUROPEENNE: 'Union Européenne',
      NONE: '',
    };
  }

  static get ID_PREFIX() {
    return 'skill';
  }

  static get WORKBENCH_NAME() {
    return '@workbench';
  }

  get isLive() {
    return [Skill.STATUSES.EN_CONSTRUCTION, Skill.STATUSES.ACTIF].includes(this.status);
  }

  get isEnConstruction() {
    return this.status === Skill.STATUSES.EN_CONSTRUCTION;
  }

  get isActif() {
    return this.status === Skill.STATUSES.ACTIF;
  }

  prepareForCreation(tube, tubeSkills, generateNewIdFnc, normalizeNonBreakingSpaceFnc) {
    this.id = generateNewIdFnc(Skill.ID_PREFIX);
    this.status = Skill.STATUSES.EN_CONSTRUCTION;
    this.name = `${tube.name}${this.level}`;
    this.version = tubeSkills.filter((skill) => skill.level === this.level).length + 1;
    if (this.hint_i18n?.fr) {
      this.hint_i18n.fr = normalizeNonBreakingSpaceFnc(this.hint_i18n.fr);
    }
  }

  cloneSkillAndChallenges({ tubeDestination, level, skillChallenges, tubeSkills, attachments, generateNewIdFnc }) {
    const version = tubeSkills.filter((sk) => sk.level === level).length + 1;
    const name = `${tubeDestination.name}${level}`;
    const id = generateNewIdFnc(Skill.ID_PREFIX);
    const liveChallenges = skillChallenges.filter((ch) => [Challenge.STATUSES.PROPOSE, Challenge.STATUSES.VALIDE].includes(ch.status));
    const prototypesWithActiveFirst = liveChallenges
      .filter((ch) => ch.genealogy === Challenge.GENEALOGIES.PROTOTYPE)
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
      const declinaisons = liveChallenges
        .filter((ch) => ch.genealogy === Challenge.GENEALOGIES.DECLINAISON && ch.version === prototype.version)
        .sort((decliA, decliB) => {
          if (!decliA.alternativeVersion) return 1;
          if (!decliB.alternativeVersion) return -1;
          return decliA.alternativeVersion - decliB.alternativeVersion;
        });
      let alternativeVersion = 1;
      for (const declinaison of declinaisons) {
        const { clonedChallenge: cloneDecli, clonedAttachments: cloneAttachmentsDecli } = declinaison.cloneChallengeAndAttachments({
          skillId: id,
          competenceId: tubeDestination.competenceId,
          generateNewIdFnc,
          prototypeVersion,
          alternativeVersion,
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
      pixValue: null,
      tubeId: tubeDestination.id,
      tubeAirtableId: tubeDestination.airtableId,
      competenceId: tubeDestination.competenceId,
      status: Skill.STATUSES.EN_CONSTRUCTION,
      description: this.description,
      descriptionStatus: this.descriptionStatus,
      hint_i18n: this.hint_i18n,
      hintStatus: this.hintStatus,
      tutorialIds: this.tutorialIds,
      tutorialAirtableIds: this.tutorialAirtableIds,
      learningMoreTutorialIds: this.learningMoreTutorialIds,
      learningMoreTutorialAirtableIds: this.learningMoreTutorialAirtableIds,
      internationalisation: this.internationalisation,
    });
    return {
      clonedSkill,
      clonedChallenges,
      clonedAttachments,
    };
  }

  update(command, normalizeNonBreakingSpaceFnc) {
    this.description = command.description;
    this.descriptionStatus = command.descriptionStatus;
    this.hintStatus = command.clueStatus;
    this.hint_i18n = { fr: normalizeNonBreakingSpaceFnc(command.clue), en: command.clueEn };
    this.internationalisation = command.i18n;
    this.learningMoreTutorialAirtableIds = command.tutoMoreAirtableIds;
    const oldStatus = this.status;
    this.status = command.status;
    this.tutorialAirtableIds = command.tutoSolutionAirtableIds;
    if (oldStatus !== this.status) {
      const now = new Date();
      if (this.status === Skill.STATUSES.ARCHIVE) {
        this.archivedAt = now;
      }
      if (this.status === Skill.STATUSES.ACTIF) {
        this.activatedAt = now;
      }
      if (this.status === Skill.STATUSES.PERIME) {
        this.obsoletedAt = now;
      }
    }
  }
}
