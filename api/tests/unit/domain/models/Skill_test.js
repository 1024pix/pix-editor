import { beforeEach, describe, expect, it, vi } from 'vitest';
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
        learningMoreTutorialIds: ['tutoDEF'],
        internationalisation: 'Monde',
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
        competenceId: tubeDestination.competenceId,
      });

      expect(clonedSkill.id).toEqual(clonedSkillId);
      expect(clonedSkill.version).toEqual(expectedClonedSkill.version);
      expect(clonedSkill.name).toEqual(expectedClonedSkill.name);
      expect(clonedSkill.status).toEqual(expectedClonedSkill.status);
      expect(clonedSkill.level).toEqual(expectedClonedSkill.level);
      expect(clonedSkill.tubeId).toEqual(expectedClonedSkill.tubeId);
      expect(clonedSkill.competenceId).toEqual(expectedClonedSkill.competenceId);
      expect(clonedChallenges).toEqual(['clonedChallenge']);
      expect(clonedAttachments).toEqual(['clonedAttachment']);

      expect(clonedSkill.description).toEqual(skillToClone.description);
      expect(clonedSkill.hint_i18n).toEqual(skillToClone.hint_i18n);
      expect(clonedSkill.hintStatus).toEqual(skillToClone.hintStatus);
      expect(clonedSkill.tutorialIds).toEqual(skillToClone.tutorialIds);
      expect(clonedSkill.learningMoreTutorialIds).toEqual(skillToClone.learningMoreTutorialIds);
      expect(clonedSkill.internationalisation).toEqual(skillToClone.internationalisation);
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
        learningMoreTutorialIds: ['tutoDEF'],
        internationalisation: 'Monde',
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
        competenceId: tubeDestination.competenceId,
      });

      expect(clonedSkill.id).toEqual(clonedSkillId);
      expect(clonedSkill.version).toEqual(expectedClonedSkill.version);
      expect(clonedSkill.name).toEqual(expectedClonedSkill.name);
      expect(clonedSkill.status).toEqual(expectedClonedSkill.status);
      expect(clonedSkill.level).toEqual(expectedClonedSkill.level);
      expect(clonedSkill.tubeId).toEqual(expectedClonedSkill.tubeId);
      expect(clonedSkill.competenceId).toEqual(expectedClonedSkill.competenceId);
      expect(clonedChallenges).toEqual(['clonedChallenge']);
      expect(clonedAttachments).toEqual(['clonedAttachment']);

      expect(clonedSkill.description).toEqual(skillToClone.description);
      expect(clonedSkill.hint_i18n).toEqual(skillToClone.hint_i18n);
      expect(clonedSkill.hintStatus).toEqual(skillToClone.hintStatus);
      expect(clonedSkill.tutorialIds).toEqual(skillToClone.tutorialIds);
      expect(clonedSkill.learningMoreTutorialIds).toEqual(skillToClone.learningMoreTutorialIds);
      expect(clonedSkill.internationalisation).toEqual(skillToClone.internationalisation);
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
        competenceId: 'unAutreCompetenceId',
        description: 'description de mon acquis',
        hint_i18n: { fr: 'mon super hint en francais' },
        tutorialIds: ['tutoABC'],
        learningMoreTutorialIds: ['tutoDEF'],
        internationalisation: 'Monde',
      });

      const perimeProto = domainBuilder.buildChallenge({ id: 'perimeProtoId', version: 3, genealogy: 'Prototype 1', status: Challenge.STATUSES.PERIME });
      const archiveProto = domainBuilder.buildChallenge({ id: 'archiveProtoId', version: 4, genealogy: 'Prototype 1', status: Challenge.STATUSES.ARCHIVE });
      const activeProto = domainBuilder.buildChallenge({ id: 'activeProtoId', version: 5, genealogy: 'Prototype 1', status: Challenge.STATUSES.VALIDE });
      const decliPerimeProtoActive = domainBuilder.buildChallenge({ id: 'decliPerimeProtoActiveId', version: 5, alternativeVersion: 1, genealogy: 'Décliné 1', status: Challenge.STATUSES.PERIME });
      const decliArchiveProtoActive = domainBuilder.buildChallenge({ id: 'decliArchiveProtoActiveId', version: 5, alternativeVersion: 2, genealogy: 'Décliné 1', status: Challenge.STATUSES.ARCHIVE });
      const decliValideProtoActive = domainBuilder.buildChallenge({ id: 'decliValideProtoActiveId', version: 5, alternativeVersion: 3, genealogy: 'Décliné 1', status: Challenge.STATUSES.VALIDE });
      const decliProposeProtoActive = domainBuilder.buildChallenge({ id: 'decliProposeProtoActiveId', version: 5, alternativeVersion: 4, genealogy: 'Décliné 1', status: Challenge.STATUSES.PROPOSE });
      const proposeProto = domainBuilder.buildChallenge({ id: 'proposeProtoId', version: 7, genealogy: 'Prototype 1', status: Challenge.STATUSES.PROPOSE });
      const decliPerimeProtoPropose = domainBuilder.buildChallenge({ id: 'decliPerimeProtoProposeId', version: 7, genealogy: 'Décliné 1', status: Challenge.STATUSES.PERIME });
      const decliProposeProtoPropose = domainBuilder.buildChallenge({ id: 'decliProposeProtoProposeId', version: 7, genealogy: 'Décliné 1', status: Challenge.STATUSES.PROPOSE });
      skillChallenges = [
        perimeProto,
        archiveProto,
        activeProto,
        decliPerimeProtoActive,
        decliArchiveProtoActive,
        decliValideProtoActive,
        decliProposeProtoActive,
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
      expect(clonedAttachments).toEqual(['activeProtoId_attachment', 'decliValideProtoActiveId_attachment', 'decliProposeProtoActiveId_attachment', 'proposeProtoId_attachment', 'decliProposeProtoProposeId_attachment']);
      expect(clonedChallenges).toEqual(['activeProtoId', 'decliValideProtoActiveId', 'decliProposeProtoActiveId', 'proposeProtoId', 'decliProposeProtoProposeId']);
      expect(spies[perimeProto.id]).toHaveBeenCalledTimes(0);
      expect(spies[archiveProto.id]).toHaveBeenCalledTimes(0);
      expect(spies[decliPerimeProtoActive.id]).toHaveBeenCalledTimes(0);
      expect(spies[decliArchiveProtoActive.id]).toHaveBeenCalledTimes(0);
      expect(spies[decliPerimeProtoPropose.id]).toHaveBeenCalledTimes(0);
      expect(spies[activeProto.id]).toHaveBeenCalledTimes(1);
      expect(spies[activeProto.id]).toHaveBeenCalledWith({ skillId: clonedSkillId, competenceId: tubeDestination.competenceId, generateNewIdFnc, alternativeVersion: null, prototypeVersion: 1 });
      expect(spies[decliValideProtoActive.id]).toHaveBeenCalledTimes(1);
      expect(spies[decliValideProtoActive.id]).toHaveBeenCalledWith({ skillId: clonedSkillId, competenceId: tubeDestination.competenceId, generateNewIdFnc, alternativeVersion: 1, prototypeVersion: 1 });
      expect(spies[decliProposeProtoActive.id]).toHaveBeenCalledTimes(1);
      expect(spies[decliProposeProtoActive.id]).toHaveBeenCalledWith({ skillId: clonedSkillId, competenceId: tubeDestination.competenceId, generateNewIdFnc, alternativeVersion: 2, prototypeVersion: 1 });
      expect(spies[proposeProto.id]).toHaveBeenCalledTimes(1);
      expect(spies[proposeProto.id]).toHaveBeenCalledWith({ skillId: clonedSkillId, competenceId: tubeDestination.competenceId, generateNewIdFnc, alternativeVersion: null, prototypeVersion: 2 });
      expect(spies[decliProposeProtoPropose.id]).toHaveBeenCalledTimes(1);
      expect(spies[decliProposeProtoPropose.id]).toHaveBeenCalledWith({ skillId: clonedSkillId, competenceId: tubeDestination.competenceId, generateNewIdFnc, alternativeVersion: 1, prototypeVersion: 2 });
    });
  });
});
