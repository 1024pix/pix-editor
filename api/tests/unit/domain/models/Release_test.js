import { beforeEach, describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { ChallengeForRelease } from '../../../../lib/domain/models/release/index.js';

describe('Unit | Domain | Release', () => {
  describe('#get operativeChallenges', () => {
    it('should only return operative challenges', () => {
      // given
      const release = domainBuilder.buildDomainRelease.withContent({
        challengesFromRelease: [
          domainBuilder.buildChallengeForRelease({ id: 'valideChal0', status: ChallengeForRelease.STATUSES.VALIDE }),
          domainBuilder.buildChallengeForRelease({ id: 'perimeChal0', status: ChallengeForRelease.STATUSES.PERIME }),
          domainBuilder.buildChallengeForRelease({ id: 'proposeChal0', status: ChallengeForRelease.STATUSES.PROPOSE }),
          domainBuilder.buildChallengeForRelease({ id: 'archiveChal0', status: ChallengeForRelease.STATUSES.ARCHIVE }),
        ],
      });

      // when
      const operativeChallenges = release.operativeChallenges;

      // then
      expect(operativeChallenges).toHaveLength(2);
      expect(operativeChallenges.map((c) => c.id)).toContain('valideChal0');
      expect(operativeChallenges.map((c) => c.id)).toContain('archiveChal0');
    });
    it('should return an empty array if no operative challenges', () => {
      // given
      const release = domainBuilder.buildDomainRelease.withContent({
        challengesFromRelease: [
          domainBuilder.buildChallengeForRelease({ id: 'perimeChal0', status: ChallengeForRelease.STATUSES.PERIME }),
          domainBuilder.buildChallengeForRelease({ id: 'proposeChal0', status: ChallengeForRelease.STATUSES.PROPOSE }),
        ],
      });

      // when
      const operativeChallenges = release.operativeChallenges;

      // then
      expect(operativeChallenges).toStrictEqual([]);
    });
  });

  describe('#findOriginForChallenge', () => {
    let challengeWithNoSkill, challengeWithNoTube, challengeWithNoCompetence, challengeWithNoOrigin, challengeOk;
    let release;

    beforeEach(() => {
      const competence = domainBuilder.buildCompetenceForRelease({
        id: 'competenceId1',
        origin: 'competenceOrigin',
        name_i18n: {
          fr: 'competence name'
        },
      });
      const competenceNoOrigin = domainBuilder.buildCompetenceForRelease({
        id: 'competenceNoOriginId',
        origin: null,
        name_i18n: {
          fr: 'competence no origin name'
        },
      });
      const tube =  domainBuilder.buildTubeForRelease({
        id: 'tubeId1',
        competenceId: competence.id,
      });
      const tubeNoCompetence =  domainBuilder.buildTubeForRelease({
        id: 'tubeNoCompetenceId',
        competenceId: 'competenceUnknown',
      });
      const tubeNoOrigin =  domainBuilder.buildTubeForRelease({
        id: 'tubeNoOriginId',
        competenceId: competenceNoOrigin.id,
      });
      const skill = domainBuilder.buildSkillForRelease({
        id: 'skillId1',
        tubeId: tube.id,
        name: '@mySkill1',
      });
      const skillNoTube = domainBuilder.buildSkillForRelease({
        id: 'skillNoTubeId',
        tubeId: 'tubeUnknown',
        name: '@mySkill2',
      });
      const skillNoCompetence = domainBuilder.buildSkillForRelease({
        id: 'skillNoCompetenceId',
        tubeId: tubeNoCompetence.id,
        name: '@mySkill3',
      });
      const skillNoOrigin = domainBuilder.buildSkillForRelease({
        id: 'skillNoOriginId',
        tubeId: tubeNoOrigin.id,
        name: '@mySkill4',
      });
      challengeWithNoSkill = domainBuilder.buildChallengeForRelease({
        id: 'challengeIdWithNoSkill',
        skillId: 'skillUnknown',
        status: ChallengeForRelease.STATUSES.VALIDE,
      });
      challengeWithNoTube = domainBuilder.buildChallengeForRelease({
        id: 'challengeIdWithNoTube',
        skillId: skillNoTube.id,
        status: ChallengeForRelease.STATUSES.VALIDE,
      });
      challengeWithNoCompetence = domainBuilder.buildChallengeForRelease({
        id: 'challengeIdWithNoCompetence',
        skillId: skillNoCompetence.id,
        status: ChallengeForRelease.STATUSES.VALIDE,
      });
      challengeWithNoOrigin = domainBuilder.buildChallengeForRelease({
        id: 'challengeIdWithNoOrigin',
        skillId: skillNoOrigin.id,
        status: ChallengeForRelease.STATUSES.VALIDE,
      });
      challengeOk = domainBuilder.buildChallengeForRelease({
        id: 'challengeIdOk',
        skillId: skill.id,
        status: ChallengeForRelease.STATUSES.VALIDE,
      });
      release = domainBuilder.buildDomainRelease.withContent({
        competencesFromRelease: [competence, competenceNoOrigin],
        tubesFromRelease: [tube, tubeNoCompetence, tubeNoOrigin],
        skillsFromRelease: [skill, skillNoTube, skillNoCompetence, skillNoOrigin],
        challengesFromRelease: [challengeWithNoSkill, challengeWithNoTube, challengeWithNoCompetence, challengeWithNoOrigin, challengeOk],
      });
    });

    it('should return null when no skill found for challenge', () => {
      // when
      const origin = release.findOriginForChallenge(challengeWithNoSkill);

      // then
      expect(origin).toStrictEqual(null);
    });

    it('should return null when no tube found for challenge', () => {
      // when
      const origin = release.findOriginForChallenge(challengeWithNoTube);

      // then
      expect(origin).toStrictEqual(null);
    });

    it('should return null when no competence found for challenge', () => {
      // when
      const origin = release.findOriginForChallenge(challengeWithNoCompetence);

      // then
      expect(origin).toStrictEqual(null);
    });

    it('should return null when no origin found for challenge', () => {
      // when
      const origin = release.findOriginForChallenge(challengeWithNoOrigin);

      // then
      expect(origin).toStrictEqual(null);
    });

    it('should return the origin', () => {
      // when
      const origin = release.findOriginForChallenge(challengeOk);

      // then
      expect(origin).toStrictEqual('competenceOrigin');
    });
  });

  describe('#findCompetenceNameForChallenge', () => {
    let challengeWithNoSkill, challengeWithNoTube, challengeWithNoCompetence, challengeOk;
    let release;

    beforeEach(() => {
      const competence = domainBuilder.buildCompetenceForRelease({
        id: 'competenceId1',
        origin: 'competenceOrigin',
        name_i18n: {
          fr: 'competence name'
        },
      });
      const tube =  domainBuilder.buildTubeForRelease({
        id: 'tubeId1',
        competenceId: competence.id,
      });
      const tubeNoCompetence =  domainBuilder.buildTubeForRelease({
        id: 'tubeNoCompetenceId',
        competenceId: 'competenceUnknown',
      });
      const skill = domainBuilder.buildSkillForRelease({
        id: 'skillId1',
        tubeId: tube.id,
        name: '@mySkill1',
      });
      const skillNoTube = domainBuilder.buildSkillForRelease({
        id: 'skillNoTubeId',
        tubeId: 'tubeUnknown',
        name: '@mySkill2',
      });
      const skillNoCompetence = domainBuilder.buildSkillForRelease({
        id: 'skillNoCompetenceId',
        tubeId: tubeNoCompetence.id,
        name: '@mySkill3',
      });
      challengeWithNoSkill = domainBuilder.buildChallengeForRelease({
        id: 'challengeIdWithNoSkill',
        skillId: 'skillUnknown',
        status: ChallengeForRelease.STATUSES.VALIDE,
      });
      challengeWithNoTube = domainBuilder.buildChallengeForRelease({
        id: 'challengeIdWithNoTube',
        skillId: skillNoTube.id,
        status: ChallengeForRelease.STATUSES.VALIDE,
      });
      challengeWithNoCompetence = domainBuilder.buildChallengeForRelease({
        id: 'challengeIdWithNoCompetence',
        skillId: skillNoCompetence.id,
        status: ChallengeForRelease.STATUSES.VALIDE,
      });
      challengeOk = domainBuilder.buildChallengeForRelease({
        id: 'challengeIdOk',
        skillId: skill.id,
        status: ChallengeForRelease.STATUSES.VALIDE,
      });
      release = domainBuilder.buildDomainRelease.withContent({
        competencesFromRelease: [competence],
        tubesFromRelease: [tube, tubeNoCompetence],
        skillsFromRelease: [skill, skillNoTube, skillNoCompetence],
        challengesFromRelease: [challengeWithNoSkill, challengeWithNoTube, challengeWithNoCompetence, challengeOk],
      });
    });

    it('should return null when no skill found for challenge', () => {
      // when
      const competenceName = release.findCompetenceNameForChallenge(challengeWithNoSkill);

      // then
      expect(competenceName).toStrictEqual(null);
    });

    it('should return null when no tube found for challenge', () => {
      // when
      const competenceName = release.findCompetenceNameForChallenge(challengeWithNoTube);

      // then
      expect(competenceName).toStrictEqual(null);
    });

    it('should return null when no competence found for challenge', () => {
      // when
      const competenceName = release.findCompetenceNameForChallenge(challengeWithNoCompetence);

      // then
      expect(competenceName).toStrictEqual(null);
    });

    it('should return the competence name', () => {
      // when
      const competenceName = release.findCompetenceNameForChallenge(challengeOk);

      // then
      expect(competenceName).toStrictEqual('competence name');
    });
  });

  describe('#findSkillNameForChallenge', () => {
    let challengeWithNoSkill, challengeOk;
    let release;

    beforeEach(() => {
      const skill = domainBuilder.buildSkillForRelease({
        id: 'skillId1',
        name: '@mySkill1',
      });
      challengeWithNoSkill = domainBuilder.buildChallengeForRelease({
        id: 'challengeIdWithNoSkill',
        skillId: 'skillUnknown',
        status: ChallengeForRelease.STATUSES.VALIDE,
      });
      challengeOk = domainBuilder.buildChallengeForRelease({
        id: 'challengeIdOk',
        skillId: skill.id,
        status: ChallengeForRelease.STATUSES.VALIDE,
      });
      release = domainBuilder.buildDomainRelease.withContent({
        skillsFromRelease: [skill],
        challengesFromRelease: [challengeWithNoSkill, challengeOk],
      });
    });

    it('should return null when no skill found for challenge', () => {
      // when
      const skillName = release.findSkillNameForChallenge(challengeWithNoSkill);

      // then
      expect(skillName).toStrictEqual(null);
    });

    it('should return skill name', () => {
      // when
      const skillName = release.findSkillNameForChallenge(challengeOk);

      // then
      expect(skillName).toStrictEqual('@mySkill1');
    });
  });

  describe('#findCompetenceNamesForTutorial', () => {
    let tutorialInSeveralCompetences, tutorialWithNoCompetence, tutorialWithNoSkill;
    let release;

    beforeEach(() => {
      const competence1 = domainBuilder.buildCompetenceForRelease({
        id: 'competenceId1',
        name_i18n: {
          fr: 'competence1 name',
        },
      });
      const competence2 = domainBuilder.buildCompetenceForRelease({
        id: 'competenceId2',
        name_i18n: {
          fr: 'competence2 name',
        },
      });
      const tube1 =  domainBuilder.buildTubeForRelease({
        id: 'tubeId1',
        competenceId: competence1.id,
      });
      const tube2 =  domainBuilder.buildTubeForRelease({
        id: 'tubeId2',
        competenceId: competence2.id,
      });
      const skill1 = domainBuilder.buildSkillForRelease({
        id: 'skillId1',
        tubeId: tube1.id,
        name: '@mySkill1',
        tutorialIds: ['tutorialInSeveralCompetences'],
        learningMoreTutorialIds: [],
      });
      const skill2 = domainBuilder.buildSkillForRelease({
        id: 'skillId2',
        tubeId: tube2.id,
        name: '@mySkill2',
        tutorialIds: [],
        learningMoreTutorialIds: ['tutorialInSeveralCompetences'],
      });
      const skillNoTube = domainBuilder.buildSkillForRelease({
        id: 'skillNoTubeId',
        tubeId: 'tubeUnknown',
        name: '@mySkill3',
        tutorialIds: ['tutorialWithNoCompetence'],
      });
      tutorialInSeveralCompetences = domainBuilder.buildTutorialForRelease({
        id: 'tutorialInSeveralCompetences',
      });
      tutorialWithNoCompetence = domainBuilder.buildTutorialForRelease({
        id: 'tutorialWithNoCompetence',
      });
      tutorialWithNoSkill = domainBuilder.buildTutorialForRelease({
        id: 'tutorialWithNoSkill',
      });
      release = domainBuilder.buildDomainRelease.withContent({
        competencesFromRelease: [competence1, competence2],
        tubesFromRelease: [tube1, tube2],
        skillsFromRelease: [skill1, skill2, skillNoTube],
        tutorialsFromRelease: [tutorialInSeveralCompetences, tutorialWithNoCompetence, tutorialWithNoSkill],
      });
    });

    it('should return empty array when tutorial linked to none', () => {
      // when
      const competenceNames = release.findCompetenceNamesForTutorial(tutorialWithNoSkill);

      // then
      expect(competenceNames).toStrictEqual([]);
    });

    it('should return empty array when tutorial linked to skill in no competence', () => {
      // when
      const competenceNames = release.findCompetenceNamesForTutorial(tutorialWithNoCompetence);

      // then
      expect(competenceNames).toStrictEqual([]);
    });

    it('should return competence names of competences to which tutorial is linked', () => {
      // when
      const competenceNames = release.findCompetenceNamesForTutorial(tutorialInSeveralCompetences);

      // then
      expect(competenceNames).toStrictEqual(['competence1 name', 'competence2 name']);
    });
  });

  describe('#findSkillNamesForTutorial', () => {
    let tutorialInSeveralCompetences, tutorialWithNoSkill;
    let release;

    beforeEach(() => {
      const skill1 = domainBuilder.buildSkillForRelease({
        id: 'skillId1',
        name: '@mySkill1',
        tutorialIds: ['tutorialInSeveralCompetences'],
        learningMoreTutorialIds: [],
      });
      const skill2 = domainBuilder.buildSkillForRelease({
        id: 'skillId2',
        name: '@mySkill2',
        tutorialIds: [],
        learningMoreTutorialIds: ['tutorialInSeveralCompetences'],
      });
      tutorialInSeveralCompetences = domainBuilder.buildTutorialForRelease({
        id: 'tutorialInSeveralCompetences',
      });
      tutorialWithNoSkill = domainBuilder.buildTutorialForRelease({
        id: 'tutorialWithNoSkill',
      });
      release = domainBuilder.buildDomainRelease.withContent({
        skillsFromRelease: [skill1, skill2],
        tutorialsFromRelease: [tutorialInSeveralCompetences, tutorialWithNoSkill],
      });
    });

    it('should return empty array when tutorial linked to none', () => {
      // when
      const skillNames = release.findSkillNamesForTutorial(tutorialWithNoSkill);

      // then
      expect(skillNames).toStrictEqual([]);
    });

    it('should return skill names of skills to which tutorial is linked', () => {
      // when
      const skillNames = release.findSkillNamesForTutorial(tutorialInSeveralCompetences);

      // then
      expect(skillNames).toStrictEqual(['@mySkill1', '@mySkill2']);
    });
  });
});
