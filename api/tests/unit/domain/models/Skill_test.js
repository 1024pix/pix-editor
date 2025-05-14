import { beforeEach, describe, describe as context, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { Challenge, Skill } from '../../../../lib/domain/models/index.js';

describe('Unit | Domain | Skill', () => {
  describe('#get isLive', () => {
    it('should return true when skill is active', () => {
      // given
      const skill  = domainBuilder.buildSkill({
        status: Skill.STATUSES.ACTIF,
      });

      // when
      const isLive = skill.isLive;

      // then
      expect(isLive).to.be.true;
    });

    it('should return true when skill is en construction', () => {
      // given
      const skill  = domainBuilder.buildSkill({
        status: Skill.STATUSES.EN_CONSTRUCTION,
      });

      // when
      const isLive = skill.isLive;

      // then
      expect(isLive).to.be.true;
    });

    it.each(Object.keys(Skill.STATUSES).filter((statusKey) => ![Skill.STATUSES.ACTIF, Skill.STATUSES.EN_CONSTRUCTION].includes(Skill.STATUSES[statusKey]))
    )('should return false when status key is %s', (statusKey) => {
      // given
      const skill  = domainBuilder.buildSkill({
        status: Skill.STATUSES[statusKey],
      });

      // when
      const isLive = skill.isLive;

      // then
      expect(isLive).to.be.false;
    });
  });

  describe('#get isEnConstruction', () => {
    it('should return true when skill is enConstruction', () => {
      // given
      const skill  = domainBuilder.buildSkill({
        status: Skill.STATUSES.EN_CONSTRUCTION,
      });

      // when
      const isEnConstruction = skill.isEnConstruction;

      // then
      expect(isEnConstruction).to.be.true;
    });

    it.each(Object.keys(Skill.STATUSES).filter((statusKey) => Skill.STATUSES[statusKey] !== Skill.STATUSES.EN_CONSTRUCTION)
    )('should return false when status key is %s', (statusKey) => {
      // given
      const skill  = domainBuilder.buildSkill({
        status: Skill.STATUSES[statusKey],
      });

      // when
      const isEnConstruction = skill.isEnConstruction;

      // then
      expect(isEnConstruction).to.be.false;
    });
  });

  describe('#get isActif', () => {
    it('should return true when skill is actif', () => {
      // given
      const skill  = domainBuilder.buildSkill({
        status: Skill.STATUSES.ACTIF,
      });

      // when
      const isActif = skill.isActif;

      // then
      expect(isActif).to.be.true;
    });

    it.each(Object.keys(Skill.STATUSES).filter((statusKey) => Skill.STATUSES[statusKey] !== Skill.STATUSES.ACTIF)
    )('should return false when status key is %s', (statusKey) => {
      // given
      const skill  = domainBuilder.buildSkill({
        status: Skill.STATUSES[statusKey],
      });

      // when
      const isActif = skill.isActif;

      // then
      expect(isActif).to.be.false;
    });
  });

  describe('#cloneSkillAndChallenges', () => {
    const clonedSkillId = 'clonedSkillId';
    const level = 4;
    let generateNewIdFnc, tubeDestination, skillChallenges;

    beforeEach(() => {
      generateNewIdFnc = vi.fn().mockImplementation(() => clonedSkillId);
      tubeDestination = domainBuilder.buildTube({
        id: 'tubeACB',
        airtableId: 'recTubeACB',
        competenceId: 'competenceA',
        name: '@monSuperTube',
      });
      const lonelyChallenge = domainBuilder.buildChallenge();
      vi.spyOn(lonelyChallenge, 'cloneChallengeAndAttachments').mockReturnValue({
        clonedChallenge: 'clonedChallenge',
        clonedAttachments: ['clonedAttachment'],
      });
      skillChallenges = [lonelyChallenge];
    });

    it('should duplicate skill when destination has no skills', () => {
      // given
      const tubeSkills = [
        domainBuilder.buildSkill({
          id: 'skillTubeABC1Id',
          tubeId: tubeDestination.id,
          level: 1,
        }),
        domainBuilder.buildSkill({
          id: 'skillTubeABC2Id',
          tubeId: tubeDestination.id,
          level: 2,
        }),
      ];
      const skillToClone = domainBuilder.buildSkill({
        id: 'skillToCloneId',
        version: 3,
        name: '@unTube5',
        status: Skill.STATUSES.ACTIF,
        level: 5,
        tubeId: 'tubeUnAutreTubeId',
        competenceId: 'unAutreCompetenceId',
        description: 'description de mon acquis',
        hint_i18n: { fr: 'mon super hint en francais' },
        tutorialIds: ['tutoABC'],
        tutorialAirtableIds: ['recTutoABC'],
        learningMoreTutorialIds: ['tutoDEF'],
        learningMoreTutorialAirtableIds: ['recTutoDEF'],
        internationalisation: Skill.INTERNATIONALISATIONS.MONDE,
      });

      // when
      const {
        clonedSkill,
        clonedChallenges,
        clonedAttachments,
      } = skillToClone.cloneSkillAndChallenges({
        tubeDestination,
        level,
        skillChallenges,
        tubeSkills,
        generateNewIdFnc,
      });

      // then
      const expectedClonedSkill = domainBuilder.buildSkill({
        id: clonedSkillId,
        version: 1,
        level: 4,
        name: '@monSuperTube4',
        status: 'en construction',
        tubeId: tubeDestination.id,
        tubeAirtableId: tubeDestination.airtableId,
        competenceId: tubeDestination.competenceId,
      });

      expect(clonedSkill.id).toBe(clonedSkillId);
      expect(clonedSkill.version).toBe(expectedClonedSkill.version);
      expect(clonedSkill.name).toBe(expectedClonedSkill.name);
      expect(clonedSkill.status).toBe(expectedClonedSkill.status);
      expect(clonedSkill.level).toBe(expectedClonedSkill.level);
      expect(clonedSkill.tubeId).toBe(expectedClonedSkill.tubeId);
      expect(clonedSkill.tubeAirtableId).toBe(expectedClonedSkill.tubeAirtableId);
      expect(clonedSkill.competenceId).toBe(expectedClonedSkill.competenceId);
      expect(clonedChallenges).toEqual(['clonedChallenge']);
      expect(clonedAttachments).toEqual(['clonedAttachment']);

      expect(clonedSkill.description).toBe(skillToClone.description);
      expect(clonedSkill.pixValue).toBeNull();
      expect(clonedSkill.hint_i18n).toEqual(skillToClone.hint_i18n);
      expect(clonedSkill.hintStatus).toBe(skillToClone.hintStatus);
      expect(clonedSkill.tutorialIds).toEqual(skillToClone.tutorialIds);
      expect(clonedSkill.tutorialAirtableIds).toEqual(skillToClone.tutorialAirtableIds);
      expect(clonedSkill.learningMoreTutorialIds).toEqual(skillToClone.learningMoreTutorialIds);
      expect(clonedSkill.learningMoreTutorialAirtableIds).toEqual(skillToClone.learningMoreTutorialAirtableIds);
      expect(clonedSkill.internationalisation).toBe(skillToClone.internationalisation);
    });

    it('should set the good version when destination has several skills', () => {
      // given
      const tubeSkills = [
        domainBuilder.buildSkill({
          id: 'skillTubeABC1Id',
          tubeId: tubeDestination.id,
          level: 1,
        }),
        domainBuilder.buildSkill({
          id: 'skillTubeABC2Id',
          tubeId: tubeDestination.id,
          level,
        }),
      ];
      const skillToClone = domainBuilder.buildSkill({
        id: 'skillToCloneId',
        version: 3,
        name: '@unTube5',
        status: Skill.STATUSES.ACTIF,
        level: 5,
        tubeId: 'tubeUnAutreTubeId',
        competenceId: 'unAutreCompetenceId',
        description: 'description de mon acquis',
        hint_i18n: { fr: 'mon super hint en francais' },
        tutorialIds: ['tutoABC'],
        tutorialAirtableIds: ['recTutoABC'],
        learningMoreTutorialIds: ['tutoDEF'],
        learningMoreTutorialAirtableIds: ['recTutoDEF'],
        internationalisation: Skill.INTERNATIONALISATIONS.MONDE,
      });

      // when
      const {
        clonedSkill,
        clonedChallenges,
        clonedAttachments,
      } = skillToClone.cloneSkillAndChallenges({
        tubeDestination,
        level,
        skillChallenges,
        tubeSkills,
        generateNewIdFnc,
      });

      // then
      const expectedClonedSkill = domainBuilder.buildSkill({
        id: clonedSkillId,
        version: 2,
        level: 4,
        name: '@monSuperTube4',
        status: 'en construction',
        tubeId: tubeDestination.id,
        tubeAirtableId: tubeDestination.airtableId,
        competenceId: tubeDestination.competenceId,
      });

      expect(clonedSkill.id).toBe(clonedSkillId);
      expect(clonedSkill.version).toBe(expectedClonedSkill.version);
      expect(clonedSkill.name).toBe(expectedClonedSkill.name);
      expect(clonedSkill.status).toBe(expectedClonedSkill.status);
      expect(clonedSkill.level).toBe(expectedClonedSkill.level);
      expect(clonedSkill.tubeId).toBe(expectedClonedSkill.tubeId);
      expect(clonedSkill.tubeAirtableId).toBe(expectedClonedSkill.tubeAirtableId);
      expect(clonedSkill.competenceId).toBe(expectedClonedSkill.competenceId);
      expect(clonedChallenges).toEqual(['clonedChallenge']);
      expect(clonedAttachments).toEqual(['clonedAttachment']);

      expect(clonedSkill.description).toBe(skillToClone.description);
      expect(clonedSkill.hint_i18n).toEqual(skillToClone.hint_i18n);
      expect(clonedSkill.hintStatus).toBe(skillToClone.hintStatus);
      expect(clonedSkill.tutorialIds).toEqual(skillToClone.tutorialIds);
      expect(clonedSkill.tutorialAirtableIds).toEqual(skillToClone.tutorialAirtableIds);
      expect(clonedSkill.learningMoreTutorialIds).toEqual(skillToClone.learningMoreTutorialIds);
      expect(clonedSkill.learningMoreTutorialAirtableIds).toEqual(skillToClone.learningMoreTutorialAirtableIds);
      expect(clonedSkill.internationalisation).toBe(skillToClone.internationalisation);
    });

    it('should handle reversioning of all challenges', () => {
      // given
      const tubeSkills = [
        domainBuilder.buildSkill({
          id: 'skillTubeABC2Id',
          tubeId: tubeDestination.id,
          level,
        }),
      ];
      const skillToClone = domainBuilder.buildSkill({
        id: 'skillToCloneId',
        version: 3,
        name: '@unTube5',
        status: Skill.STATUSES.ACTIF,
        level: 5,
        tubeId: 'tubeUnAutreTubeId',
        tubeAirtableId: 'recTubeUnAutreTubeId',
        competenceId: 'unAutreCompetenceId',
        description: 'description de mon acquis',
        hint_i18n: { fr: 'mon super hint en francais' },
        tutorialIds: ['tutoABC'],
        tutorialAirtableIds: ['recTutoABC'],
        learningMoreTutorialIds: ['tutoDEF'],
        learningMoreTutorialAirtableIds: ['recTutoDEF'],
        internationalisation: Skill.INTERNATIONALISATIONS.MONDE,
      });

      const perimeProto = domainBuilder.buildChallenge({ id: 'perimeProtoId', version: 3, genealogy: Challenge.GENEALOGIES.PROTOTYPE, status: Challenge.STATUSES.PERIME });
      const archiveProto = domainBuilder.buildChallenge({ id: 'archiveProtoId', version: 4, genealogy: Challenge.GENEALOGIES.PROTOTYPE, status: Challenge.STATUSES.ARCHIVE });
      const activeProto = domainBuilder.buildChallenge({ id: 'activeProtoId', version: 5, genealogy: Challenge.GENEALOGIES.PROTOTYPE, status: Challenge.STATUSES.VALIDE });
      const decliPerimeProtoActive = domainBuilder.buildChallenge({ id: 'decliPerimeProtoActiveId', version: 5, alternativeVersion: 1, genealogy: Challenge.GENEALOGIES.DECLINAISON, status: Challenge.STATUSES.PERIME });
      const decliArchiveProtoActive = domainBuilder.buildChallenge({ id: 'decliArchiveProtoActiveId', version: 5, alternativeVersion: 2, genealogy: Challenge.GENEALOGIES.DECLINAISON, status: Challenge.STATUSES.ARCHIVE });
      const decliValide1ProtoActive = domainBuilder.buildChallenge({ id: 'decliValide1ProtoActiveId', version: 5, alternativeVersion: null, genealogy: Challenge.GENEALOGIES.DECLINAISON, status: Challenge.STATUSES.VALIDE });
      const decliProposeProtoActive = domainBuilder.buildChallenge({ id: 'decliProposeProtoActiveId', version: 5, alternativeVersion: 4, genealogy: Challenge.GENEALOGIES.DECLINAISON, status: Challenge.STATUSES.PROPOSE });
      const decliValide2ProtoActive = domainBuilder.buildChallenge({ id: 'decliValide2ProtoActiveId', version: 5, alternativeVersion: 6, genealogy: 'Décliné 1', status: Challenge.STATUSES.VALIDE });
      const proposeProto = domainBuilder.buildChallenge({ id: 'proposeProtoId', version: 7, genealogy: Challenge.GENEALOGIES.PROTOTYPE, status: Challenge.STATUSES.PROPOSE });
      const decliPerimeProtoPropose = domainBuilder.buildChallenge({ id: 'decliPerimeProtoProposeId', version: 7, genealogy: Challenge.GENEALOGIES.DECLINAISON, status: Challenge.STATUSES.PERIME });
      const decliProposeProtoPropose = domainBuilder.buildChallenge({ id: 'decliProposeProtoProposeId', version: 7, genealogy: Challenge.GENEALOGIES.DECLINAISON, status: Challenge.STATUSES.PROPOSE });
      skillChallenges = [
        perimeProto,
        archiveProto,
        activeProto,
        decliValide2ProtoActive,
        decliPerimeProtoActive,
        decliArchiveProtoActive,
        decliProposeProtoActive,
        decliValide1ProtoActive,
        proposeProto,
        decliPerimeProtoPropose,
        decliProposeProtoPropose,
      ];
      const spies = {};
      for (const challenge of skillChallenges) {
        spies[challenge.id] = vi.spyOn(challenge, 'cloneChallengeAndAttachments').mockImplementation(() => ({
          clonedChallenge: challenge.id,
          clonedAttachments: [`${challenge.id}_attachment`],
        }));
      }

      // when
      const { clonedChallenges, clonedAttachments } = skillToClone.cloneSkillAndChallenges({
        tubeDestination,
        level,
        skillChallenges,
        tubeSkills,
        generateNewIdFnc,
      });

      // then
      expect(clonedAttachments).toEqual(['activeProtoId_attachment', 'decliProposeProtoActiveId_attachment', 'decliValide2ProtoActiveId_attachment', 'decliValide1ProtoActiveId_attachment', 'proposeProtoId_attachment', 'decliProposeProtoProposeId_attachment']);
      expect(clonedChallenges).toEqual(['activeProtoId', 'decliProposeProtoActiveId', 'decliValide2ProtoActiveId', 'decliValide1ProtoActiveId', 'proposeProtoId', 'decliProposeProtoProposeId']);
      expect(spies[perimeProto.id]).toHaveBeenCalledTimes(0);
      expect(spies[archiveProto.id]).toHaveBeenCalledTimes(0);
      expect(spies[decliPerimeProtoActive.id]).toHaveBeenCalledTimes(0);
      expect(spies[decliArchiveProtoActive.id]).toHaveBeenCalledTimes(0);
      expect(spies[decliPerimeProtoPropose.id]).toHaveBeenCalledTimes(0);
      expect(spies[activeProto.id]).toHaveBeenCalledTimes(1);
      expect(spies[activeProto.id]).toHaveBeenCalledWith({ skillId: clonedSkillId, competenceId: tubeDestination.competenceId, generateNewIdFnc, alternativeVersion: null, prototypeVersion: 1 });
      expect(spies[decliValide1ProtoActive.id]).toHaveBeenCalledTimes(1);
      expect(spies[decliValide1ProtoActive.id]).toHaveBeenCalledWith({ skillId: clonedSkillId, competenceId: tubeDestination.competenceId, generateNewIdFnc, alternativeVersion: 3, prototypeVersion: 1 });
      expect(spies[decliValide2ProtoActive.id]).toHaveBeenCalledTimes(1);
      expect(spies[decliValide2ProtoActive.id]).toHaveBeenCalledWith({ skillId: clonedSkillId, competenceId: tubeDestination.competenceId, generateNewIdFnc, alternativeVersion: 2, prototypeVersion: 1 });
      expect(spies[decliProposeProtoActive.id]).toHaveBeenCalledTimes(1);
      expect(spies[decliProposeProtoActive.id]).toHaveBeenCalledWith({ skillId: clonedSkillId, competenceId: tubeDestination.competenceId, generateNewIdFnc, alternativeVersion: 1, prototypeVersion: 1 });
      expect(spies[proposeProto.id]).toHaveBeenCalledTimes(1);
      expect(spies[proposeProto.id]).toHaveBeenCalledWith({ skillId: clonedSkillId, competenceId: tubeDestination.competenceId, generateNewIdFnc, alternativeVersion: null, prototypeVersion: 2 });
      expect(spies[decliProposeProtoPropose.id]).toHaveBeenCalledTimes(1);
      expect(spies[decliProposeProtoPropose.id]).toHaveBeenCalledWith({ skillId: clonedSkillId, competenceId: tubeDestination.competenceId, generateNewIdFnc, alternativeVersion: 1, prototypeVersion: 2 });
    });
  });

  describe('#archiveSkillAndChallenges', () => {
    it('should archive skill', () => {
      // given
      const challenge1 = domainBuilder.buildChallenge();
      const challenge2 = domainBuilder.buildChallenge();
      vi.spyOn(challenge1, 'archive').mockImplementation(() => true);
      vi.spyOn(challenge2, 'archive').mockImplementation(() => true);
      const skillChallenges = [challenge1, challenge2];
      const skillToArchive = domainBuilder.buildSkill({
        status: Skill.STATUSES.ACTIF,
      });

      // when
      skillToArchive.archiveSkillAndChallenges({ skillChallenges });

      // then
      const expectedArchivedSkill = domainBuilder.buildSkill({
        status: Skill.STATUSES.ARCHIVE,
      });
      expect(skillToArchive).toStrictEqual(expectedArchivedSkill);
      expect(challenge1.archive).toHaveBeenCalledTimes(1);
      expect(challenge2.archive).toHaveBeenCalledTimes(1);
    });
  });

  describe('#prepareForCreation', () => {
    const createdSkillId = 'createdSkillId';
    let generateNewIdFnc, normalizeNonBreakingSpaceFnc;

    beforeEach(() => {
      generateNewIdFnc = vi.fn().mockImplementation(() => createdSkillId);
      normalizeNonBreakingSpaceFnc = vi.fn().mockImplementation((str) => str);
    });

    it('should set fields for creation', () => {
      // given
      const skill = domainBuilder.buildSkill({
        name: null,
        level: 6,
        status: null,
        version: null,
      });

      const tube = domainBuilder.buildTube({
        name: '@test',
      });

      const tubeSkills = [
        domainBuilder.buildSkill({ level: 1 }),
        domainBuilder.buildSkill({ level: 1 }),
        domainBuilder.buildSkill({ level: 3 }),
        domainBuilder.buildSkill({ level: 3 }),
        domainBuilder.buildSkill({ level: 3 }),
        domainBuilder.buildSkill({ level: 4 }),
        domainBuilder.buildSkill({ level: 6 }),
        domainBuilder.buildSkill({ level: 7 }),
        domainBuilder.buildSkill({ level: 7 }),
        domainBuilder.buildSkill({ level: 7 }),
        domainBuilder.buildSkill({ level: 7 }),
      ];

      // when
      skill.prepareForCreation(tube, tubeSkills, generateNewIdFnc, normalizeNonBreakingSpaceFnc);

      // then
      expect(skill).toHaveProperty('id', createdSkillId);
      expect(skill).toHaveProperty('name', '@test6');
      expect(skill).toHaveProperty('level', 6);
      expect(skill).toHaveProperty('status', Skill.STATUSES.EN_CONSTRUCTION);
      expect(skill).toHaveProperty('version', 2);
    });

    context('hint', function() {
      it('should normalize non breaking spaces on "fr" hints', function() {
        // given
        normalizeNonBreakingSpaceFnc = vi.fn().mockImplementation(() => 'Je suis passée dans la fonction ! YOUPI');
        const tube = domainBuilder.buildTube({
          name: '@test',
        });
        const skill = domainBuilder.buildSkill({
          name: null,
          level: 6,
          status: null,
          version: null,
          hint_i18n: {
            'nl': 'Je vais rester tel quel',
            'fr': 'Je vais passer dans la fonction',
            'en': 'Je vais rester tel quel',
          },
        });

        // when
        skill.prepareForCreation(tube, [], generateNewIdFnc, normalizeNonBreakingSpaceFnc);

        // then
        expect(skill).toHaveProperty('hint_i18n', {
          'nl': 'Je vais rester tel quel',
          'fr': 'Je suis passée dans la fonction ! YOUPI',
          'en': 'Je vais rester tel quel',
        });
      });
    });

    context('when tube is @workbench', () => {

      it('should set name to tube’s name and version to null', () => {
      // given
        const skill = domainBuilder.buildSkill({
          name: null,
          level: 0,
          status: null,
          version: null,
        });

        const tube = domainBuilder.buildTube({
          name: '@workbench',
        });

        const tubeSkills = [];

        // when
        skill.prepareForCreation(tube, tubeSkills, generateNewIdFnc, normalizeNonBreakingSpaceFnc);

        // then
        expect(skill).toHaveProperty('id', createdSkillId);
        expect(skill).toHaveProperty('name', '@workbench');
        expect(skill).toHaveProperty('level', null);
        expect(skill).toHaveProperty('status', Skill.STATUSES.EN_CONSTRUCTION);
        expect(skill).toHaveProperty('version', null);
      });
    });
  });

  describe('#update', () => {

    it('should set specific fields for update', function() {
      // given
      const originalData = {
        id: 'originalId',
        airtableId: 'originalAirtableId',
        name: 'originalName',
        description: 'originalDescription',
        descriptionStatus: Skill.DESCRIPTION_STATUSES.A_RETRAVAILLER,
        hint_i18n: {
          fr: 'original hint fr',
          en: 'original hint en',
        },
        hintStatus: Skill.HINT_STATUSES.A_RETRAVAILLER,
        tutorialIds: ['originalTutoId'],
        tutorialAirtableIds: ['originalTutoAirtableId'],
        learningMoreTutorialIds: ['originalLMTutoId'],
        learningMoreTutorialAirtableIds: ['originalLMTutoAirtableId'],
        competenceId: 'originalCompetenceId',
        pixValue: 1,
        status: Skill.STATUSES.ACTIF,
        tubeId: 'originalTubeId',
        tubeAirtableId: 'originalTubeAirtableId',
        level: 1,
        internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
        version: 2,
        challengeIds: ['originalChallengeId'],
        createdAt: new Date('2021-10-29'),
      };
      const skill = domainBuilder.buildSkill(originalData);
      const updateCommand = {
        airtableId: 'someValueWeDONotUse',
        description: 'newDescription',
        descriptionStatus: Skill.DESCRIPTION_STATUSES.VALIDE,
        clue: 'new hint fr',
        clueEn: 'new hint en',
        clueStatus: Skill.HINT_STATUSES.PRE_VALIDE,
        i18n: Skill.INTERNATIONALISATIONS.NONE,
        status: Skill.STATUSES.ARCHIVE,
        tutoSolutionAirtableIds: ['newTutoAirtableId'],
        tutoMoreAirtableIds: ['newLMTutoAirtableId'],
      };

      // when
      skill.update(updateCommand);

      // then
      expect(skill).toStrictEqual(domainBuilder.buildSkill({
        ...originalData,
        description: 'newDescription',
        descriptionStatus: Skill.DESCRIPTION_STATUSES.VALIDE,
        hint_i18n: {
          fr: 'new hint fr',
          en: 'new hint en',
        },
        hintStatus: Skill.HINT_STATUSES.PRE_VALIDE,
        internationalisation: Skill.INTERNATIONALISATIONS.NONE,
        tutorialAirtableIds: ['newTutoAirtableId'],
        learningMoreTutorialAirtableIds: ['newLMTutoAirtableId'],
        status: Skill.STATUSES.ARCHIVE,
      }));
    });
  });
});
