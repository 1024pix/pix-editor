import { beforeEach, describe, expect, it } from 'vitest';

import { databaseBuilder } from '../test-helper.js';
import { BindEnglishChallengesToFrenchPrimaryEquivalent, listActiveSkillsByFrameworkName } from '../../scripts/bind-english-challenges-to-french-primary-equivalent.js';
import { logger } from '../../lib/infrastructure/logger.js';
import { Skill } from '../../lib/domain/models/Skill.js';
import { Challenge } from '../../lib/domain/models/Challenge.js';

describe('Script | BindEnglishChallengesToFrenchPrimaryEquivalent', () => {
  /** @type {BindEnglishChallengesToFrenchPrimaryEquivalent} */
  let script;

  beforeEach(() => {
    script = new BindEnglishChallengesToFrenchPrimaryEquivalent();
  });

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
