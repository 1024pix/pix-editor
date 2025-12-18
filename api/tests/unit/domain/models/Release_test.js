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
      const release = domainBuilder.buildDomainRelease.withContent({ challengesFromRelease: [domainBuilder.buildChallengeForRelease({ id: 'perimeChal0', status: ChallengeForRelease.STATUSES.PERIME }), domainBuilder.buildChallengeForRelease({ id: 'proposeChal0', status: ChallengeForRelease.STATUSES.PROPOSE })] });

      // when
      const operativeChallenges = release.operativeChallenges;

      // then
      expect(operativeChallenges).toStrictEqual([]);
    });
  });

  describe('#findOriginForChallenge', () => {
    let challengeWithNoSkill, challengeWithNoCompetence, challengeWithNoOrigin, challengeOk;
    let release;

    beforeEach(() => {
      const competence = domainBuilder.buildCompetenceForRelease({
        id: 'competenceId1',
        origin: 'competenceOrigin',
        name_i18n: { fr: 'competence name' },
      });
      const competenceNoOrigin = domainBuilder.buildCompetenceForRelease({
        id: 'competenceNoOriginId',
        origin: null,
        name_i18n: { fr: 'competence no origin name' },
      });
      const skill = domainBuilder.buildSkillForRelease({
        id: 'skillId1',
        competenceId: competence.id,
        name: '@mySkill1',
      });
      const skillNoCompetence = domainBuilder.buildSkillForRelease({
        id: 'skillNoCompetenceId',
        competenceId: 'competenceUnknown',
        name: '@mySkill3',
      });
      const skillNoOrigin = domainBuilder.buildSkillForRelease({
        id: 'skillNoOriginId',
        competenceId: competenceNoOrigin.id,
        name: '@mySkill4',
      });
      challengeWithNoSkill = domainBuilder.buildChallengeForRelease({
        id: 'challengeIdWithNoSkill',
        skillId: 'skillUnknown',
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
        skillsFromRelease: [
          skill,
          skillNoCompetence,
          skillNoOrigin,
        ],
        challengesFromRelease: [
          challengeWithNoSkill,
          challengeWithNoCompetence,
          challengeWithNoOrigin,
          challengeOk,
        ],
      });
    });

    it('should return null when no skill found for challenge', () => {
      // when
      const origin = release.findOriginForChallenge(challengeWithNoSkill);

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
    let challengeWithNoSkill, challengeWithNoCompetence, challengeOk;
    let release;

    beforeEach(() => {
      const competence = domainBuilder.buildCompetenceForRelease({
        id: 'competenceId1',
        origin: 'competenceOrigin',
        name_i18n: { fr: 'competence name' },
      });
      const skill = domainBuilder.buildSkillForRelease({
        id: 'skillId1',
        competenceId: competence.id,
        name: '@mySkill1',
      });
      const skillNoCompetence = domainBuilder.buildSkillForRelease({
        id: 'skillNoCompetenceId',
        competenceId: 'competenceUnknown',
        name: '@mySkill3',
      });
      challengeWithNoSkill = domainBuilder.buildChallengeForRelease({
        id: 'challengeIdWithNoSkill',
        skillId: 'skillUnknown',
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
        skillsFromRelease: [skill, skillNoCompetence],
        challengesFromRelease: [
          challengeWithNoSkill,
          challengeWithNoCompetence,
          challengeOk,
        ],
      });
    });

    it('should return null when no skill found for challenge', () => {
      // when
      const competenceName = release.findCompetenceNameForChallenge(challengeWithNoSkill);

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

  describe('#findTubeNameForChallenge', () => {
    let challengeWithNoSkill, challengeWithNoTube, challengeOk;
    let release;

    beforeEach(() => {
      const tube = domainBuilder.buildTubeForRelease({
        id: 'tubeId1',
        name: 'tube1Name',
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
      challengeOk = domainBuilder.buildChallengeForRelease({
        id: 'challengeIdOk',
        skillId: skill.id,
        status: ChallengeForRelease.STATUSES.VALIDE,
      });
      release = domainBuilder.buildDomainRelease.withContent({
        tubesFromRelease: [tube],
        skillsFromRelease: [skill, skillNoTube],
        challengesFromRelease: [
          challengeWithNoSkill,
          challengeWithNoTube,
          challengeOk,
        ],
      });
    });

    it('should return null when no skill found for challenge', () => {
      // when
      const tubeName = release.findTubeNameForChallenge(challengeWithNoSkill);

      // then
      expect(tubeName).toStrictEqual(null);
    });

    it('should return null when no tube found for challenge', () => {
      // when
      const tubeName = release.findTubeNameForChallenge(challengeWithNoTube);

      // then
      expect(tubeName).toStrictEqual(null);
    });

    it('should return the tube name', () => {
      // when
      const tubeName = release.findTubeNameForChallenge(challengeOk);

      // then
      expect(tubeName).toStrictEqual('tube1Name');
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
});
