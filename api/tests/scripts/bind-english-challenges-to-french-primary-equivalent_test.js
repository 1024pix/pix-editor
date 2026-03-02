import { beforeEach, describe, expect, it } from 'vitest';

import { databaseBuilder, domainBuilder } from '../test-helper.js';
import {
  assertEachLegacyEnglishChallengeHasActiveFrenchChallenge,
  BindEnglishChallengesToFrenchPrimaryEquivalent,
  listActiveFrenchChallengesBySkillId,
  listActiveSkillsByFrameworkName,
  listLegacyEnglishChallengesBySkillId,
} from '../../scripts/bind-english-challenges-to-french-primary-equivalent.js';
import { logger } from '../../lib/infrastructure/logger.js';
import { Challenge, LocalizedChallenge, Skill } from '../../lib/domain/models/index.js';

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

    describe('listActiveFrenchChallengesBySkillId', () => {
      it('should retrieve all active french challenges for a given skill id', async () => {
        const { skill, challenge } = databaseBuilder.factory.buildChallengeInGroup({
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

        const validatedEnglishChallenge1 = databaseBuilder.factory.buildChallenge({
          id: 'validatedChallengeId1',
          skillId: skill.id,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          status: Challenge.STATUSES.VALIDE,
          locales: ['en'],
          isQualityOk: true,
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: validatedEnglishChallenge1.id,
          challengeId: validatedEnglishChallenge1.id,
          locale: 'en',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.validatedChallengeId1.instructions',
          locale: 'en',
          value: 'EN instructions',
        });

        const validatedFrenchChallenge2 = databaseBuilder.factory.buildChallenge({
          id: 'validatedChallengeId2',
          skillId: skill.id,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          status: Challenge.STATUSES.VALIDE,
          locales: ['fr'],
          isQualityOk: false,
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: validatedFrenchChallenge2.id,
          challengeId: validatedFrenchChallenge2.id,
          locale: 'fr',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.validatedChallengeId2.instructions',
          locale: 'fr',
          value: 'FR instructions',
        });
        const proposedFrenchChallenge3 = databaseBuilder.factory.buildChallenge({
          id: 'proposedChallengeId3',
          skillId: skill.id,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          status: Challenge.STATUSES.PROPOSE,
          locales: ['fr'],
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: proposedFrenchChallenge3.id,
          challengeId: proposedFrenchChallenge3.id,
          locale: 'fr',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.proposedChallengeId3.instructions',
          locale: 'fr',
          value: 'FR instructions',
        });
        const archivedFrenchChallenge4 = databaseBuilder.factory.buildChallenge({
          id: 'archivedChallengeId4',
          skillId: skill.id,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          status: Challenge.STATUSES.ARCHIVE,
          locales: ['fr'],
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: archivedFrenchChallenge4.id,
          challengeId: archivedFrenchChallenge4.id,
          locale: 'fr',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.archivedChallengeId4.instructions',
          locale: 'fr',
          value: 'FR instructions',
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
        const validatedNLChallenge6 = databaseBuilder.factory.buildChallenge({
          id: 'validatedChallengeId6',
          skillId: skill.id,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          status: Challenge.STATUSES.VALIDE,
          locales: ['nl'],
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: validatedNLChallenge6.id,
          challengeId: validatedNLChallenge6.id,
          locale: 'nl',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.validatedChallengeId6.instructions',
          locale: 'nl',
          value: 'NL instructions',
        });

        await databaseBuilder.commit();

        // when
        const activeFrenchChallenges = await listActiveFrenchChallengesBySkillId(skill.id);

        // then
        expect(activeFrenchChallenges).toHaveLength(2);
        expect(activeFrenchChallenges.map((challenge) => challenge.id)).toStrictEqual([challenge.id, 'validatedChallengeId2']);
        expect(activeFrenchChallenges.every((challenge) => challenge.status === Challenge.STATUSES.VALIDE)).toBe(true);
        expect(activeFrenchChallenges.every((challenge) => challenge.locales.includes('fr') && challenge.locales.length === 1)).toBe(true);
      });
    });

    describe('assertEachLegacyEnglishChallengeHasActiveFrenchChallenge', () => {
      describe('when there are enough french challenges to accomodate every english challenge', () => {
        describe('exactly the same amount of french and english challenges', () => {
          it('should not throw', async () => {
            // given
            const frenchChallenges = [
              domainBuilder.buildChallenge({
                id: 'challengeFrId1',
                locales: ['fr'],
                status: Challenge.STATUSES.VALIDE,
              }),
              domainBuilder.buildChallenge({
                id: 'challengeFrId2',
                locales: ['fr', 'nl'],
                status: Challenge.STATUSES.VALIDE,
                localizedChallenges: [
                  domainBuilder.buildLocalizedChallenge({
                    id: 'challengeFrId2',
                    challengeId: 'challengeFrId2',
                    locale: 'fr',
                  }),
                  domainBuilder.buildLocalizedChallenge({
                    id: 'challengeFrId2-NL',
                    challengeId: 'challengeFrId2',
                    locale: 'nl',
                    status: LocalizedChallenge.STATUSES.PLAY,
                  }),
                ],
              }),
            ];
            const englishChallenges = [
              domainBuilder.buildChallenge({
                id: 'challengeEnId1',
                locales: ['en'],
                status: Challenge.STATUSES.VALIDE,
              }),
              domainBuilder.buildChallenge({
                id: 'challengeEnId2',
                locales: ['en'],
                status: Challenge.STATUSES.VALIDE,
              }),
            ];

            // then
            expect(assertEachLegacyEnglishChallengeHasActiveFrenchChallenge(englishChallenges, frenchChallenges)).toBeUndefined();
          });
        });

        describe('less english challenges than validated french challenges', () => {
          it('should not throw', async () => {
            // given
            const frenchChallenges = [
              domainBuilder.buildChallenge({
                id: 'challengeFrId1',
                locales: ['fr'],
                status: Challenge.STATUSES.VALIDE,
              }),
              domainBuilder.buildChallenge({
                id: 'challengeFrId2',
                locales: ['fr'],
                status: Challenge.STATUSES.PROPOSE,
              }),
              domainBuilder.buildChallenge({
                id: 'challengeFrId3',
                locales: ['fr'],
                status: Challenge.STATUSES.PERIME,
              }),
              domainBuilder.buildChallenge({
                id: 'challengeFrId4',
                locales: ['fr'],
                status: Challenge.STATUSES.VALIDE,
              }),
              domainBuilder.buildChallenge({
                id: 'challengeFrEnId5',
                locales: ['fr', 'en'],
                status: Challenge.STATUSES.VALIDE,
                localizedChallenges: [
                  domainBuilder.buildLocalizedChallenge({
                    id: 'challengeFrEnId5',
                    challengeId: 'challengeFrEnId5',
                    locale: 'fr',
                  }),
                  domainBuilder.buildLocalizedChallenge({
                    id: 'challengeFrEnId5-EN',
                    challengeId: 'challengeFrEnId5',
                    locale: 'en',
                    status: LocalizedChallenge.STATUSES.PLAY,
                  }),
                ],
              }),
            ];
            const englishChallenges = [
              domainBuilder.buildChallenge({
                id: 'challengeEnId1',
                locales: ['en'],
                status: Challenge.STATUSES.VALIDE,
              }),
            ];

            // then
            expect(assertEachLegacyEnglishChallengeHasActiveFrenchChallenge(englishChallenges, frenchChallenges)).toBeUndefined();
          });
        });

        describe('when there already are english localized but enough validated french challenges without english localized', () => {
          it('should not throw', () => {
            // given
            const frenchChallenges = [
              domainBuilder.buildChallenge({
                id: 'challengeFrId1',
                locales: ['fr'],
                status: Challenge.STATUSES.VALIDE,

              }),
              domainBuilder.buildChallenge({
                id: 'challengeFrId2',
                locales: ['fr'],
                status: Challenge.STATUSES.PROPOSE,
              }),
              domainBuilder.buildChallenge({
                id: 'challengeFrId3',
                locales: ['fr'],
                status: Challenge.STATUSES.PERIME,
              }),
              domainBuilder.buildChallenge({
                id: 'challengeFrEnId4',
                locales: ['fr', 'en'],
                status: Challenge.STATUSES.VALIDE,
              }),
            ];
            const englishChallenges = [
              domainBuilder.buildChallenge({
                id: 'challengeEnId1',
                locales: ['en'],
                status: Challenge.STATUSES.VALIDE,
              }),
            ];

            // then
            expect(assertEachLegacyEnglishChallengeHasActiveFrenchChallenge(englishChallenges, frenchChallenges)).toBeUndefined();
          });
        });
      });

      describe('when there aren\'t enough french challenges for every english challenge', () => {
        it('should throw', async () => {
          // given
          const frenchChallenges = [
            domainBuilder.buildChallenge({
              id: 'challengeFrId1',
              locales: ['fr'],
              status: Challenge.STATUSES.VALIDE,
            }),
            domainBuilder.buildChallenge({
              id: 'challengeFrId2',
              locales: ['fr'],
              status: Challenge.STATUSES.PROPOSE,
            }),
            domainBuilder.buildChallenge({
              id: 'challengeFrId3',
              locales: ['fr'],
              status: Challenge.STATUSES.PERIME,
            }),
            domainBuilder.buildChallenge({
              id: 'challengeFrId3',
              locales: ['fr'],
              status: Challenge.STATUSES.ARCHIVE,
            }),
          ];
          const englishChallenges = [
            domainBuilder.buildChallenge({
              id: 'challengeEnId1',
              locales: ['en'],
              status: Challenge.STATUSES.VALIDE,
            }),
            domainBuilder.buildChallenge({
              id: 'challengeEnId2',
              locales: ['en'],
              status: Challenge.STATUSES.VALIDE,
            }),
          ];

          // then
          expect(
            () => assertEachLegacyEnglishChallengeHasActiveFrenchChallenge(englishChallenges, frenchChallenges),
          ).toThrowError('Not enough active french challenges (1) for each english challenge (2) in skill recSkillId');
        });

        describe('when there already are english localized but not enough validated french challenges without english localized', () => {
          it('should throw', () => {
            // given
            const frenchChallenges = [
              domainBuilder.buildChallenge({
                id: 'challengeFrId1',
                locales: ['fr'],
                status: Challenge.STATUSES.VALIDE,
              }),
              domainBuilder.buildChallenge({
                id: 'challengeFrId2',
                locales: ['fr'],
                status: Challenge.STATUSES.PROPOSE,
              }),
              domainBuilder.buildChallenge({
                id: 'challengeFrId3',
                locales: ['fr'],
                status: Challenge.STATUSES.PERIME,
              }),
              domainBuilder.buildChallenge({
                id: 'challengeFrEnId4',
                locales: ['fr', 'en'],
                status: Challenge.STATUSES.VALIDE,
                localizedChallenges: [
                  domainBuilder.buildLocalizedChallenge({
                    id: 'challengeFrEnId4',
                    challengeId: 'challengeFrEnId4',
                    locale: 'fr',
                  }),
                  domainBuilder.buildLocalizedChallenge({
                    id: 'challengeFrEnId4-EN',
                    challengeId: 'challengeFrEnId4',
                    locale: 'en',
                    status: LocalizedChallenge.STATUSES.PLAY,
                  }),
                ],
              }),
            ];
            const englishChallenges = [
              domainBuilder.buildChallenge({
                id: 'challengeEnId1',
                locales: ['en'],
                status: Challenge.STATUSES.VALIDE,
              }),
              domainBuilder.buildChallenge({
                id: 'challengeEnId2',
                locales: ['en'],
                status: Challenge.STATUSES.VALIDE,
              }),
            ];

            // then
            expect(
              () => assertEachLegacyEnglishChallengeHasActiveFrenchChallenge(englishChallenges, frenchChallenges),
            ).toThrowError('Not enough active french challenges without english localized (1) for each english challenge (2) in skill recSkillId');
          });
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
