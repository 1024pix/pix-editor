import { beforeEach, describe, expect, it } from 'vitest';

import { databaseBuilder } from '../test-helper.js';
import {
  BindEnglishChallengesToFrenchPrimaryEquivalent,
  listActiveSkillsByFrameworkName,
  listLegacyEnglishChallengesBySkillId,
} from '../../scripts/bind-english-challenges-to-french-primary-equivalent.js';
import { logger } from '../../lib/infrastructure/logger.js';
import { Challenge, Skill } from '../../lib/domain/models/index.js';

describe('Script | BindEnglishChallengesToFrenchPrimaryEquivalent', () => {
  /** @type {BindEnglishChallengesToFrenchPrimaryEquivalent} */
  let script;

  // beforeEach(() => {
  //   script = new BindEnglishChallengesToFrenchPrimaryEquivalent();
  // });

  describe('Unit', () => {
    describe('listActiveSkillsByFrameworkName', () => {
      it('should retrieve all active skills', async () => {
        // given
        const { tube, skill } = databaseBuilder.factory.buildChallengeInGroup({
          framework: { name: 'Pix' },
          tube: { name: 'activePixTube' },
          skill: {
            status: Skill.STATUSES.ACTIF,
            level: 6,
          },
        });

        databaseBuilder.factory.buildSkill({
          id: 'activeSkill5',
          tubeId: tube.id,
          status: Skill.STATUSES.ACTIF,
          level: 3,
        });
        databaseBuilder.factory.buildSkill({
          id: 'proposedSkill2',
          tubeId: tube.id,
          status: Skill.STATUSES.EN_CONSTRUCTION,
          name: '@proposedSkill2',
        });
        databaseBuilder.factory.buildSkill({
          id: 'archivedSkill3',
          tubeId: tube.id,
          status: Skill.STATUSES.ARCHIVE,
          name: '@archivedSkill3',
        });
        databaseBuilder.factory.buildSkill({
          id: 'obsoleteSkill4',
          tubeId: tube.id,
          status: Skill.STATUSES.PERIME,
          name: '@obsoleteSkill4',
        });

        const { tube: tube2 } = databaseBuilder.factory.buildChallengeInGroup({
          framework: { name: 'Girafe' },
          tube: { name: 'activeTube' },
          skill: {
            status: Skill.STATUSES.ACTIF,
            level: 2,
          },
        });

        databaseBuilder.factory.buildSkill({
          id: 'activeSkill5_2',
          tubeId: tube2.id,
          status: Skill.STATUSES.ACTIF,
          name: '@activeSkill5_2',
        });
        databaseBuilder.factory.buildSkill({
          id: 'proposedSkill2_2',
          tubeId: tube2.id,
          status: Skill.STATUSES.EN_CONSTRUCTION,
          name: '@proposedSkill2_2',
        });
        databaseBuilder.factory.buildSkill({
          id: 'archivedSkill3_2',
          tubeId: tube2.id,
          status: Skill.STATUSES.ARCHIVE,
          name: '@archivedSkill3_2',
        });
        databaseBuilder.factory.buildSkill({
          id: 'outdatedSkill4_2',
          tubeId: tube2.id,
          status: Skill.STATUSES.PERIME,
          name: '@outdatedSkill4_2',
        });

        await databaseBuilder.commit();

        // when
        const activeSkills = await listActiveSkillsByFrameworkName('Pix');

        // then
        expect(activeSkills).toHaveLength(2);
        expect(activeSkills.map((skill) => skill.name)).toStrictEqual(['activePixTube3', 'activePixTube6']);
        expect(activeSkills.every((skill) => skill.status === Skill.STATUSES.ACTIF)).toBe(true);
      });

      describe('when framework name does not exist', () => {
        it('should throw an error', async () => {
          // then
          await expect(listActiveSkillsByFrameworkName('')).rejects.toThrow(new Error('framework with this given name does not exist'));
        });
      });
    });

    describe('listLegacyEnglishChallengesBySkillId', () => {
      it('should retrieve all legacy english challenges for the given skill id', async () => {
        // given
        const { skill } = databaseBuilder.factory.buildChallengeInGroup({
          framework: { name: 'Pix' },
          skill: {
            status: Skill.STATUSES.ACTIF,
            name: '@activeSkill1',
          },
          challenge: {
            genealogy: Challenge.GENEALOGIES.PROTOTYPE,
            status: Challenge.STATUSES.VALIDE,
          },
        });

        const validatedChallenge1 = databaseBuilder.factory.buildChallenge({
          id: 'validatedChallengeId1',
          skillId: skill.id,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          status: Challenge.STATUSES.VALIDE,
          locales: ['en'],
          isQualityOk: true,
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: validatedChallenge1.id,
          challengeId: validatedChallenge1.id,
          locale: 'en',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.validatedChallengeId1.instructions',
          locale: 'en',
          value: 'EN instructions',
        });

        const validatedChallenge2 = databaseBuilder.factory.buildChallenge({
          id: 'validatedChallengeId2',
          skillId: skill.id,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          status: Challenge.STATUSES.VALIDE,
          locales: ['en'],
          isQualityOk: false,
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: validatedChallenge2.id,
          challengeId: validatedChallenge2.id,
          locale: 'en',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.validatedChallengeId2.instructions',
          locale: 'en',
          value: 'EN instructions',
        });
        const proposedChallenge3 = databaseBuilder.factory.buildChallenge({
          id: 'proposedChallengeId3',
          skillId: skill.id,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          status: Challenge.STATUSES.PROPOSE,
          locales: ['en'],
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: proposedChallenge3.id,
          challengeId: proposedChallenge3.id,
          locale: 'en',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.proposedChallengeId3.instructions',
          locale: 'en',
          value: 'EN instructions',
        });
        const archivedChallenge4 = databaseBuilder.factory.buildChallenge({
          id: 'archivedChallengeId4',
          skillId: skill.id,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          status: Challenge.STATUSES.ARCHIVE,
          locales: ['en'],
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: archivedChallenge4.id,
          challengeId: archivedChallenge4.id,
          locale: 'en',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.archivedChallengeId4.instructions',
          locale: 'en',
          value: 'EN instructions',
        });
        const proposedChallenge5 = databaseBuilder.factory.buildChallenge({
          id: 'proposedChallengeId5',
          skillId: skill.id,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          status: Challenge.STATUSES.PROPOSE,
          locales: ['fr'],
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: proposedChallenge5.id,
          challengeId: proposedChallenge5.id,
          locale: 'fr',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.proposedChallengeId5.instructions',
          locale: 'fr',
          value: 'FR instructions',
        });
        const validatedChallenge6 = databaseBuilder.factory.buildChallenge({
          id: 'validatedChallengeId6',
          skillId: skill.id,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          status: Challenge.STATUSES.VALIDE,
          locales: ['fr'],
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: validatedChallenge6.id,
          challengeId: validatedChallenge6.id,
          locale: 'fr',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.validatedChallengeId6.instructions',
          locale: 'fr',
          value: 'FR instructions',
        });

        await databaseBuilder.commit();

        // when
        const legacyChallenges = await listLegacyEnglishChallengesBySkillId(skill.id);

        // then
        expect(legacyChallenges).toHaveLength(3);
        expect(legacyChallenges.some((legacyChallenge) => legacyChallenge.id === 'validatedChallengeId1')).toBe(true);
        expect(legacyChallenges.every((challenge) => challenge.isPrimary)).toBe(true);
        expect(legacyChallenges.every((challenge) => challenge.locales.includes('en') && challenge.locales.length === 1)).toBe(true);
      });
    });
  });

  describe('#handle', () => {
    beforeEach(async () => {
      await databaseBuilder.commit();
    });

    it('binds english challenges to french primary equivalent', async () => {
      // given
      const options = { dryRun: false };

      // when
      await script.handle({ options, logger });

      // then
      expect(true).toBe(false);
    });

    describe('when dryRun option is true', () => {
      it('stops before deletion', async () => {
        // given
        const options = { dryRun: true };

        // when
        await script.handle({ options, logger });

        // then
        expect(true).toBe(false);
      });
    });
  });
});
