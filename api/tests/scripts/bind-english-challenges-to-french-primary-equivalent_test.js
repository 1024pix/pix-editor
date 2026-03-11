import { beforeEach, describe, expect, it, vi } from 'vitest';

import { databaseBuilder, domainBuilder } from '../test-helper.js';
import {
  BindEnglishChallengesToFrenchPrimaryEquivalent,
  byActiveFrenchChallenges,
  listActiveSkillsByFrameworkName,
  listLegacyEnglishChallengesBySkillId,
} from '../../scripts/bind-english-challenges-to-french-primary-equivalent.js';
import { logger } from '../../lib/infrastructure/logger.js';
import { Attachment, Challenge, LocalizedChallenge, Skill } from '../../lib/domain/models/index.js';
import {
  attachmentRepository,
  challengeRepository,
  localizedChallengeRepository,
  translationRepository,
} from '../../lib/infrastructure/repositories/index.js';

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
        const { tube } = databaseBuilder.factory.buildChallengeInGroup({
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
            version: 2,
          },
        });

        const oldVersionObsoletePrototype = databaseBuilder.factory.buildChallenge({
          id: 'oldVersionObsoletePrototype',
          skillId: skill.id,
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          status: Challenge.STATUSES.PERIME,
          version: 1,
          locales: ['fr'],
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: oldVersionObsoletePrototype.id,
          challengeId: oldVersionObsoletePrototype.id,
          locale: 'fr',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.oldVersionObsoletePrototype.instructions',
          locale: 'fr',
          value: 'FR instructions',
        });

        const oldVersionObsoleteDecli = databaseBuilder.factory.buildChallenge({
          id: 'oldVersionObsoleteDecli',
          skillId: skill.id,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          status: Challenge.STATUSES.PERIME,
          version: 1,
          locales: ['en'],
          isQualityOk: true,
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: oldVersionObsoleteDecli.id,
          challengeId: oldVersionObsoleteDecli.id,
          locale: 'en',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.oldVersionObsoleteDecli.instructions',
          locale: 'en',
          value: 'EN instructions',
        });

        const newVersionProposedPrototype = databaseBuilder.factory.buildChallenge({
          id: 'newVersionProposedPrototype',
          skillId: skill.id,
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          status: Challenge.STATUSES.PROPOSE,
          version: 3,
          locales: ['fr'],
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: newVersionProposedPrototype.id,
          challengeId: newVersionProposedPrototype.id,
          locale: 'fr',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.newVersionProposedPrototype.instructions',
          locale: 'fr',
          value: 'FR instructions',
        });

        const newVersionProposedDecli = databaseBuilder.factory.buildChallenge({
          id: 'newVersionProposedDecli',
          skillId: skill.id,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          status: Challenge.STATUSES.PROPOSE,
          version: 3,
          locales: ['en'],
          isQualityOk: true,
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: newVersionProposedDecli.id,
          challengeId: newVersionProposedDecli.id,
          locale: 'en',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.newVersionProposedDecli.instructions',
          locale: 'en',
          value: 'EN instructions',
        });

        const validatedChallenge1 = databaseBuilder.factory.buildChallenge({
          id: 'validatedChallengeId1',
          skillId: skill.id,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          status: Challenge.STATUSES.VALIDE,
          locales: ['en'],
          isQualityOk: true,
          version: 2,
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
          version: 2,
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
          version: 2,
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
          version: 2,
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
          version: 2,
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
          version: 2,
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

    describe('byActiveFrenchChallenges', () => {
      it('should not return a non active challenge', () => {
        // given
        const outdatedFrenchChallenge = domainBuilder.buildChallenge({
          id: 'outdatedFrenchChallenge',
          locales: ['fr'],
          status: Challenge.STATUSES.PERIME,
          localizedChallenges: [
            domainBuilder.buildLocalizedChallenge({
              id: 'outdatedFrenchChallenge-FR',
              challengeId: 'outdatedFrenchChallenge',
              locale: 'fr',
            }),
          ],
        });

        // when
        const filterResult = byActiveFrenchChallenges(outdatedFrenchChallenge);

        // then
        expect(filterResult).toBeFalsy();
      });

      it('should not return a non french challenge', () => {
        // given
        const challenges = [
          domainBuilder.buildChallenge({
            id: 'englishChallenge',
            locales: ['en'],
            status: Challenge.STATUSES.VALIDE,
          }),
          domainBuilder.buildChallenge({
            id: 'nlChallenge',
            locales: ['nl'],
            status: Challenge.STATUSES.VALIDE,
          }),
        ];

        // when
        const filterResult = challenges.filter(byActiveFrenchChallenges);

        // then
        expect(filterResult).toHaveLength(0);
      });

      it('should not return an french challenge with an english localized', () => {
        // given
        const frenchChallengeWithEnglishLocalized = domainBuilder.buildChallenge({
          id: 'challengeFrId1',
          locales: ['fr', 'nl'],
          status: Challenge.STATUSES.VALIDE,
          localizedChallenges: [
            domainBuilder.buildLocalizedChallenge({
              id: 'challengeFrId1',
              challengeId: 'challengeFrId1',
              locale: 'fr',
            }),
            domainBuilder.buildLocalizedChallenge({
              id: 'challengeFrId1-EN',
              challengeId: 'challengeFrId1',
              locale: 'en',
              status: LocalizedChallenge.STATUSES.PLAY,
            }),
          ],
        });

        // when
        const filterResult = byActiveFrenchChallenges(frenchChallengeWithEnglishLocalized);

        // then
        expect(filterResult).toBeFalsy();
      });

      it('should return a validated french challenge without any english localized', () => {
        // given
        const frenchChallengeWithoutEnglishLocalized = domainBuilder.buildChallenge({
          id: 'challengeFrId1',
          locales: ['fr', 'nl'],
          status: Challenge.STATUSES.VALIDE,
          localizedChallenges: [
            domainBuilder.buildLocalizedChallenge({
              id: 'challengeFrId1',
              challengeId: 'challengeFrId1',
              locale: 'fr',
            }),
            domainBuilder.buildLocalizedChallenge({
              id: 'challengeFrId1-NL',
              challengeId: 'challengeFrId1',
              locale: 'nl',
              status: LocalizedChallenge.STATUSES.PLAY,
            }),
          ],
        });

        // when
        const filterResult = byActiveFrenchChallenges(frenchChallengeWithoutEnglishLocalized);

        // then
        expect(filterResult).toBeTruthy();
      });
    });
  });

  describe('#handle', () => {
    beforeEach(async () => {
      await databaseBuilder.commit();
    });

    it('binds english challenges to french primary equivalent', async () => {
      // given
      const options = { dryRun: false, frameworkName: 'Pix' };
      const { skill, challenge, localizedChallenge, tube } = databaseBuilder.factory.buildChallengeInGroup({
        framework: { name: 'Pix' },
        tube: { name: 'activePixTube' },
        skill: {
          status: Skill.STATUSES.ACTIF,
          level: 6,
        },
        challenge: {
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          status: Challenge.STATUSES.VALIDE,
          locales: ['fr'],
          version: 2,
        },
        localizedChallenge: { embedUrl: 'https://pix.fr' },
      });

      const validatedFrenchChallenge = databaseBuilder.factory.buildChallenge({
        id: 'validatedFrenchChallenge',
        skillId: skill.id,
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        status: Challenge.STATUSES.VALIDE,
        locales: ['fr'],
        isQualityOk: true,
        version: 2,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: validatedFrenchChallenge.id,
        challengeId: validatedFrenchChallenge.id,
        locale: 'fr',
        embedUrl: 'https://pix.org/fr-FTR',
        urlsToConsult: ['https://pix.fr'],
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: true,
        toRephrase: true,
        geography: 'FR',
        hasEmbedInternalValidation: false,
        noValidationNeeded: false,
        validatedAt: new Date(),
      });

      const validatedEnglishChallenge1 = databaseBuilder.factory.buildChallenge({
        id: 'validatedEnglishChallenge1',
        skillId: skill.id,
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        status: Challenge.STATUSES.VALIDE,
        locales: ['en'],
        isQualityOk: true,
        version: 2,
      });
      const englishLegacyLocalized = databaseBuilder.factory.buildLocalizedChallenge({
        id: validatedEnglishChallenge1.id,
        challengeId: validatedEnglishChallenge1.id,
        locale: 'en',
        embedUrl: 'https://pix.org/en-UK',
        urlsToConsult: ['https://pix.fr'],
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: true,
        toRephrase: true,
        geography: 'UK',
        hasEmbedInternalValidation: false,
        noValidationNeeded: false,
        validatedAt: new Date(),
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.validatedEnglishChallenge1.instruction',
        locale: 'en',
        value: 'EN instructions',
      });
      const englishLegacyAttachment = databaseBuilder.factory.buildAttachment({
        id: 'attachmentEn',
        url: 'https://',
        size: 3,
        type: Attachment.TYPES.ILLUSTRATION,
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
        challengeId: validatedEnglishChallenge1.id,
        localizedChallengeId: validatedEnglishChallenge1.id,
      });

      const validatedEnglishChallenge2 = databaseBuilder.factory.buildChallenge({
        id: 'validatedEnglishChallenge2',
        skillId: skill.id,
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        status: Challenge.STATUSES.VALIDE,
        locales: ['en'],
        isQualityOk: true,
        version: 2,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: validatedEnglishChallenge2.id,
        challengeId: validatedEnglishChallenge2.id,
        locale: 'en',
        embedUrl: 'https://pix.org/en-UK',
        urlsToConsult: ['https://pix.fr'],
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: true,
        toRephrase: true,
        geography: 'UK',
        hasEmbedInternalValidation: false,
        noValidationNeeded: false,
        validatedAt: new Date(),
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.validatedEnglishChallenge2.instruction',
        locale: 'en',
        value: 'EN instructions',
      });
      databaseBuilder.factory.buildAttachment({
        id: 'attachmentEn2',
        url: 'https://',
        size: 3,
        type: Attachment.TYPES.ILLUSTRATION,
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
        challengeId: validatedEnglishChallenge2.id,
        localizedChallengeId: validatedEnglishChallenge2.id,
      });

      await databaseBuilder.commit();

      const errorLoggerSpy = vi.spyOn(logger, 'error');
      const infoLoggerSpy = vi.spyOn(logger, 'info');

      // when
      await script.handle({
        options,
        logger,
      });

      const frenchChallenges = await challengeRepository.getMany([challenge.id, 'validatedFrenchChallenge']);
      const localizedChallenges = frenchChallenges.flatMap((challenge) => challenge.localizedChallenges);
      const [englishLocalized1, englishLocalized2] = localizedChallenges.filter(({ locale }) => locale === 'en');

      const englishLocalized1Attachments = await attachmentRepository.listByLocalizedChallengeId(englishLocalized1.id);
      const englishLocalized2Attachments = await attachmentRepository.listByLocalizedChallengeId(englishLocalized2.id);

      const translations = await translationRepository.listByEntities('challenge', frenchChallenges.map((challenge) => challenge.id));
      const englishTranslations = translations.filter(({ locale }) => locale === 'en');

      const legacyEnglishChallenge = await challengeRepository.getMany([validatedEnglishChallenge1.id, validatedEnglishChallenge2.id]);

      // then
      expect(localizedChallenges.length).toEqual(4);

      expect(englishLocalized1).toStrictEqual(
        domainBuilder.buildLocalizedChallenge({
          id: `${validatedEnglishChallenge2.id}-EN`,
          challengeId: challenge.id,
          locale: 'en',
          status: LocalizedChallenge.STATUSES.PLAY,
          fileIds: [englishLocalized1Attachments[0].id],
          embedUrl: englishLegacyLocalized.embedUrl,
          primaryEmbedUrl: localizedChallenge.embedUrl,
          urlsToConsult: englishLegacyLocalized.urlsToConsult,
          requireGafamWebsiteAccess: englishLegacyLocalized.requireGafamWebsiteAccess,
          isIncompatibleIpadCertif: englishLegacyLocalized.isIncompatibleIpadCertif,
          deafAndHardOfHearing: englishLegacyLocalized.deafAndHardOfHearing,
          isAwarenessChallenge: englishLegacyLocalized.isAwarenessChallenge,
          toRephrase: englishLegacyLocalized.toRephrase,
          geography: englishLegacyLocalized.geography,
          hasEmbedInternalValidation: englishLegacyLocalized.hasEmbedInternalValidation,
          noValidationNeeded: englishLegacyLocalized.noValidationNeeded,
          validatedAt: englishLegacyLocalized.validatedAt,
        }));

      expect(englishLocalized2).toStrictEqual(domainBuilder.buildLocalizedChallenge({
        id: `${validatedEnglishChallenge1.id}-EN`,
        challengeId: validatedFrenchChallenge.id,
        locale: 'en',
        status: LocalizedChallenge.STATUSES.PLAY,
        fileIds: [englishLocalized2Attachments[0].id],
        embedUrl: englishLegacyLocalized.embedUrl,
        primaryEmbedUrl: localizedChallenge.embedUrl,
        urlsToConsult: englishLegacyLocalized.urlsToConsult,
        requireGafamWebsiteAccess: englishLegacyLocalized.requireGafamWebsiteAccess,
        isIncompatibleIpadCertif: englishLegacyLocalized.isIncompatibleIpadCertif,
        deafAndHardOfHearing: englishLegacyLocalized.deafAndHardOfHearing,
        isAwarenessChallenge: englishLegacyLocalized.isAwarenessChallenge,
        toRephrase: englishLegacyLocalized.toRephrase,
        geography: englishLegacyLocalized.geography,
        hasEmbedInternalValidation: englishLegacyLocalized.hasEmbedInternalValidation,
        noValidationNeeded: englishLegacyLocalized.noValidationNeeded,
        validatedAt: englishLegacyLocalized.validatedAt,
      },
      ));
      expect(englishLocalized2Attachments).toStrictEqual([
        domainBuilder.buildAttachment({
          id: expect.any(String),
          url: englishLegacyAttachment.url,
          size: englishLegacyAttachment.size,
          type: englishLegacyAttachment.type,
          filename: englishLegacyAttachment.filename,
          mimeType: englishLegacyAttachment.mimeType,
          challengeId: frenchChallenges[1].id,
          localizedChallengeId: englishLocalized2.id,
        }),
      ]);
      expect(englishLocalized1Attachments).toStrictEqual([
        domainBuilder.buildAttachment({
          id: expect.any(String),
          url: englishLegacyAttachment.url,
          size: englishLegacyAttachment.size,
          type: englishLegacyAttachment.type,
          filename: englishLegacyAttachment.filename,
          mimeType: englishLegacyAttachment.mimeType,
          challengeId: frenchChallenges[0].id,
          localizedChallengeId: englishLocalized1.id,
        }),
      ]);
      expect(englishTranslations).toStrictEqual([
        domainBuilder.buildTranslation({
          key: `challenge.${frenchChallenges[0].id}.instruction`,
          locale: 'en',
          value: 'EN instructions',
        }),
        domainBuilder.buildTranslation({
          key: `challenge.${frenchChallenges[1].id}.instruction`,
          locale: 'en',
          value: 'EN instructions',
        }),
      ]);
      expect(legacyEnglishChallenge[0].status).toStrictEqual(Challenge.STATUSES.PERIME);
      expect(legacyEnglishChallenge[1].status).toStrictEqual(Challenge.STATUSES.PERIME);
      expect(errorLoggerSpy).not.toHaveBeenCalled();
      expect(infoLoggerSpy).toHaveBeenNthCalledWith(1, { dryRun: false }, 'Script bindEnglishChallengesToFrenchPrimaryEquivalent has started');
      expect(infoLoggerSpy).toHaveBeenNthCalledWith(2, `Now processing ${tube.name}${skill.level} - ${skill.id}`);
      expect(infoLoggerSpy).toHaveBeenNthCalledWith(3, {
        skillId: skill.id,
        clonedEnglishLocalizedId: englishLocalized2.id,
        frenchChallengeId: frenchChallenges[1].id,
      }, 'Binding cloned english localized challenge to french challenge');
      expect(infoLoggerSpy).toHaveBeenNthCalledWith(4, {
        skillId: skill.id,
        clonedEnglishLocalizedId: englishLocalized1.id,
        frenchChallengeId: frenchChallenges[0].id,
      }, 'Binding cloned english localized challenge to french challenge');
      expect(infoLoggerSpy).toHaveBeenNthCalledWith(5, {
        skillId: skill.id,
        obsoletedEnglishChallengesCount: 2,
        clonedTranslationsCount: 2,
        clonedAttachmentsCount: 2,
      }, 'Finished processing skill activePixTube6');
      expect(infoLoggerSpy).toHaveBeenNthCalledWith(6, {
        processedEnglishChallengesCount: 2,
        skippedSkillsCount: 0,
        ignoredSkillsCount: 0,
      }, 'DONE');
    });

    describe('when framework name does not exist', () => {
      it('should throw an error', async () => {
        // given
        const options = { dryRun: false, frameworkName: 'Pix' };
        // then
        await expect(script.handle({
          options,
          logger,
        })).rejects.toThrow(new Error('framework with this given name does not exist'));
      });
    });

    describe('when an error occurs in the transaction', () => {
      it('should rollback all changes and skip the problematic skill', async () => {
        // given
        const options = { dryRun: false, frameworkName: 'Pix' };
        const { skill } = databaseBuilder.factory.buildChallengeInGroup({
          framework: { name: 'Pix' },
          tube: { name: 'activePixTube' },
          skill: {
            status: Skill.STATUSES.ACTIF,
            level: 6,
          },
          challenge: {
            genealogy: Challenge.GENEALOGIES.PROTOTYPE,
            status: Challenge.STATUSES.VALIDE,
            locales: ['fr'],
            version: 2,
          },
        });

        const validatedFrenchChallenge = databaseBuilder.factory.buildChallenge({
          id: 'validatedFrenchChallenge',
          skillId: skill.id,
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          status: Challenge.STATUSES.VALIDE,
          locales: ['fr'],
          isQualityOk: true,
          version: 2,
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: validatedFrenchChallenge.id,
          challengeId: validatedFrenchChallenge.id,
          locale: 'fr',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.validatedFrenchChallenge.instruction',
          locale: 'fr',
          value: 'FR instructions',
        });

        const validatedEnglishChallenge2 = databaseBuilder.factory.buildChallenge({
          id: 'validatedEnglishChallenge2',
          skillId: skill.id,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          status: Challenge.STATUSES.VALIDE,
          locales: ['en'],
          isQualityOk: false,
          version: 2,
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: validatedEnglishChallenge2.id,
          challengeId: validatedEnglishChallenge2.id,
          locale: 'en',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.validatedFrenchChallenge.instruction',
          locale: 'en',
          value: 'EN instructions',
        });

        await databaseBuilder.commit();

        const errorLoggerSpy = vi.spyOn(logger, 'error');
        const infoLoggerSpy = vi.spyOn(logger, 'info');
        const saveLocalizedChallengeSpy = vi.spyOn(localizedChallengeRepository, 'create').mockRejectedValue(new Error('The database disappeared 🪄'));

        // when
        await script.handle({
          options,
          logger,
        });

        // then
        expect(saveLocalizedChallengeSpy).toHaveBeenCalledOnce();
        expect(errorLoggerSpy).toHaveBeenCalledExactlyOnceWith({
          skillId: skill.id,
          err: expect.any(Error),
        }, 'Error in transaction while processing skill activePixTube6');
        expect(infoLoggerSpy).toHaveBeenCalledWith({
          processedEnglishChallengesCount: 0,
          ignoredSkillsCount: 0,
          skippedSkillsCount: 1,
        }, 'DONE');
      });
    });

    describe('when there aren\'t enough french challenges for every english challenge for a skill', () => {
      it('should log an error and skip that skill', async () => {
        // given
        const options = { dryRun: false, frameworkName: 'Pix' };
        const { challenge, skill } = databaseBuilder.factory.buildChallengeInGroup({
          framework: { name: 'Pix' },
          tube: { name: 'activePixTube' },
          skill: {
            status: Skill.STATUSES.ACTIF,
            level: 6,
          },
          challenge: {
            genealogy: Challenge.GENEALOGIES.PROTOTYPE,
            status: Challenge.STATUSES.VALIDE,
            locales: ['fr'],
            version: 2,
          },
        });

        const validatedEnglishChallenge1 = databaseBuilder.factory.buildChallenge({
          id: 'validatedEnglishChallenge1',
          skillId: skill.id,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          status: Challenge.STATUSES.VALIDE,
          locales: ['en'],
          isQualityOk: true,
          version: 2,
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: validatedEnglishChallenge1.id,
          challengeId: validatedEnglishChallenge1.id,
          locale: 'en',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.validatedEnglishChallenge1.instruction',
          locale: 'en',
          value: 'EN instructions',
        });

        const validatedEnglishChallenge2 = databaseBuilder.factory.buildChallenge({
          id: 'validatedEnglishChallenge2',
          skillId: skill.id,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          status: Challenge.STATUSES.VALIDE,
          locales: ['en'],
          isQualityOk: false,
          version: 2,
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: validatedEnglishChallenge2.id,
          challengeId: validatedEnglishChallenge2.id,
          locale: 'en',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.validatedEnglishChallenge2.instruction',
          locale: 'en',
          value: 'EN instructions',
        });

        await databaseBuilder.commit();

        const errorLoggerSpy = vi.spyOn(logger, 'error');

        // when
        await script.handle({
          options,
          logger,
        });

        // then
        const frenchChallenge = await challengeRepository.get(challenge.id);
        expect(frenchChallenge.localizedChallenges.length).toBe(1);
        expect(frenchChallenge.localizedChallenges.every((localized) => localized.locale === 'fr')).toBe(true);
        expect(errorLoggerSpy).toHaveBeenCalledExactlyOnceWith({
          skillId: skill.id,
          activeFrenchChallengeIds: [challenge.id],
          legacyEnglishChallengeIds: [validatedEnglishChallenge1.id, validatedEnglishChallenge2.id],
        }, 'Not enough active french challenges without english localized for each english challenge');
      });
    });

    describe('when dryRun option is true', () => {
      it('stops before deletion', async () => {
        // given
        const options = { dryRun: true, frameworkName: 'Pix' };
        const { skill, challenge } = databaseBuilder.factory.buildChallengeInGroup({
          framework: { name: 'Pix' },
          tube: { name: 'activePixTube' },
          skill: {
            status: Skill.STATUSES.ACTIF,
            level: 6,
          },
          challenge: {
            genealogy: Challenge.GENEALOGIES.PROTOTYPE,
            status: Challenge.STATUSES.VALIDE,
            locales: ['fr'],
          },
          localizedChallenge: { embedUrl: 'https://pix.fr' },
        });

        const validatedEnglishChallenge1 = databaseBuilder.factory.buildChallenge({
          id: 'validatedEnglishChallenge1',
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
          embedUrl: 'https://pix.org/en-UK',
          urlsToConsult: ['https://pix.fr'],
          requireGafamWebsiteAccess: true,
          isIncompatibleIpadCertif: true,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
          isAwarenessChallenge: true,
          toRephrase: true,
          geography: 'UK',
          hasEmbedInternalValidation: false,
          noValidationNeeded: false,
          validatedAt: new Date(),
        });
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.validatedEnglishChallenge1.instruction',
          locale: 'en',
          value: 'EN instructions',
        });

        await databaseBuilder.commit();

        const errorLoggerSpy = vi.spyOn(logger, 'error');

        // when
        await script.handle({
          options,
          logger,
        });

        const frenchChallenge = await challengeRepository.get(challenge.id);
        const localizedChallenges = frenchChallenge.localizedChallenges;
        const englishLocalized = localizedChallenges.find(({ locale }) => locale === 'en');
        const attachments = await attachmentRepository.list();
        const newEnglishAttachments = attachments.filter((attachment) => attachment.localizedChallengeId.endsWith('-EN'));
        const translations = await translationRepository.listByEntity('challenge', frenchChallenge.id);
        const englishTranslations = translations.filter(({ locale }) => locale === 'en');

        const legacyEnglishChallenge = await challengeRepository.get(validatedEnglishChallenge1.id);

        // then
        expect(errorLoggerSpy).not.toHaveBeenCalled();
        expect(localizedChallenges.length).toEqual(1);
        expect(englishLocalized).toBeUndefined();
        expect(newEnglishAttachments).toHaveLength(0);
        expect(englishTranslations).toHaveLength(0);

        expect(legacyEnglishChallenge.status).not.toStrictEqual(Challenge.STATUSES.PERIME);
        expect(legacyEnglishChallenge.localizedChallenges[0].status).not.toStrictEqual(LocalizedChallenge.STATUSES.PAUSE);
      });
    });
  });
});
