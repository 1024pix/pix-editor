import { beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { getSkillLocalizedChallengesProduction } from '../../../../lib/domain/usecases/index.js';
import { Challenge } from '../../../../lib/domain/models/index.js';

describe('Unit | Domain | Usecases | get-skill-localized-challenges-production', function() {
  const skillId = 'skillABCDEF';
  let challenges;
  let challengeProtoValide, challengeProtoValideDecliPerime, challengeProtoValideDecliValide;
  let challengeProtoPerime, challengeProtoPerimeDecliPerime, challengeProtoPropose;
  let challengeProtoProposeDecliPropose, challengeProtoArchive, challengeProtoArchiveDecliArchive;
  let challengeRepository, logger, dependencies;

  beforeEach(async function() {
    challengeProtoPerime = domainBuilder.buildChallenge({
      id: 'challengeProtoPerimeId',
      instruction: 'Instruction FR challengeProtoPerimeId',
      status: Challenge.STATUSES.PERIME,
      locales: ['fr'],
      skillId: 'recSkillId',
      genealogy: Challenge.GENEALOGIES.PROTOTYPE,
      author: ['BOU'],
      version: 1,
      alternativeVersion: null,
      airtableId: 'challengeProtoPerimeAirtableId',
      updatedAt: new Date('2021-10-04'),
    });
    challengeProtoPerimeDecliPerime = domainBuilder.buildChallenge({
      id: 'challengeProtoPerimeDecliPerimeId',
      instruction: 'Instruction FR challengeProtoPerimeDecliPerime',
      status: Challenge.STATUSES.PERIME,
      locales: ['fr'],
      skillId: 'recSkillId',
      genealogy: Challenge.GENEALOGIES.DECLINAISON,
      author: ['BOU'],
      version: 1,
      alternativeVersion: 1,
      airtableId: 'challengeProtoPerimeDecliPerimeAirtableId',
      updatedAt: new Date('2021-10-04'),
    });
    challengeProtoPropose = domainBuilder.buildChallenge({
      id: 'challengeProtoProposeId',
      instruction: 'Instruction FR challengeProtoProposeId',
      status: Challenge.STATUSES.PROPOSE,
      locales: ['fr'],
      skillId,
      genealogy: Challenge.GENEALOGIES.PROTOTYPE,
      author: ['BOU'],
      version: 8,
      alternativeVersion: null,
      airtableId: 'challengeProtoProposeAirtableId',
      updatedAt: new Date('2021-10-04'),
    });
    challengeProtoProposeDecliPropose = domainBuilder.buildChallenge({
      id: 'challengeProtoProposeDecliProposeId',
      instruction: 'Instruction FR challengeProtoProposeDecliPropose',
      status: Challenge.STATUSES.PROPOSE,
      locales: ['fr'],
      skillId,
      genealogy: Challenge.GENEALOGIES.DECLINAISON,
      author: ['BOU'],
      version: 8,
      alternativeVersion: 1,
      airtableId: 'challengeProtoProposeDecliProposeAirtableId',
      updatedAt: new Date('2021-10-04'),
    });
    challengeProtoArchive = domainBuilder.buildChallenge({
      id: 'challengeProtoArchiveId',
      instruction: 'Instruction FR challengeProtoArchiveId',
      status: Challenge.STATUSES.ARCHIVE,
      locales: ['fr'],
      skillId,
      genealogy: Challenge.GENEALOGIES.PROTOTYPE,
      author: ['BOU'],
      version: 2,
      alternativeVersion: null,
      airtableId: 'challengeProtoArchiveAirtableId',
      updatedAt: new Date('2021-10-04'),
    });
    challengeProtoArchiveDecliArchive = domainBuilder.buildChallenge({
      id: 'challengeProtoArchiveDecliArchiveId',
      instruction: 'Instruction FR challengeProtoArchiveDecliArchive',
      status: Challenge.STATUSES.ARCHIVE,
      locales: ['fr'],
      skillId,
      genealogy: Challenge.GENEALOGIES.DECLINAISON,
      author: ['BOU'],
      version: 2,
      alternativeVersion: 1,
      airtableId: 'challengeProtoArchiveDecliArchiveAirtableId',
      updatedAt: new Date('2021-10-04'),
    });
    challengeProtoValide = domainBuilder.buildChallenge({
      id: 'challengeProtoValideId',
      instruction: 'Instruction FR challengeProtoValideId',
      status: Challenge.STATUSES.VALIDE,
      locales: ['fr'],
      skillId,
      genealogy: Challenge.GENEALOGIES.PROTOTYPE,
      author: ['BOU'],
      version: 3,
      alternativeVersion: null,
      airtableId: 'challengeProtoValideAirtableId',
      updatedAt: new Date('2021-10-04'),
      localizedChallenges: [
        domainBuilder.buildLocalizedChallenge({
          id: 'challengeProtoValideId',
          challengeId: 'challengeProtoValideId',
          locale: 'fr',
        }),
        domainBuilder.buildLocalizedChallenge({
          id: 'challengeProtoValideEsId',
          challengeId: 'challengeProtoValideId',
          locale: 'es',
        }),
      ],
      translations: {},
    });
    challengeProtoValideDecliPerime = domainBuilder.buildChallenge({
      id: 'challengeProtoValideDecliPerimeId',
      instruction: 'Instruction FR challengeProtoValideDecliPerime',
      status: Challenge.STATUSES.PERIME,
      locales: ['fr'],
      skillId,
      genealogy: Challenge.GENEALOGIES.DECLINAISON,
      author: ['BOU'],
      version: 3,
      alternativeVersion: 2,
      airtableId: 'challengeProtoValideDecliPerimeAirtableId',
      updatedAt: new Date('2021-10-04'),
      localizedChallenges: [
        domainBuilder.buildLocalizedChallenge({
          id: 'challengeProtoValideDecliPerimeId',
          challengeId: 'challengeProtoValideDecliPerimeId',
          locale: 'fr',
        }),
        domainBuilder.buildLocalizedChallenge({
          id: 'challengeProtoValideDecliPerimeItId',
          challengeId: 'challengeProtoValideDecliPerimeId',
          locale: 'it',
        }),
      ],
      translations: {},
    });
    challengeProtoValideDecliValide = domainBuilder.buildChallenge({
      id: 'challengeProtoValideDecliValideId',
      instruction: 'Instruction FR challengeProtoValideDecliValide',
      status: Challenge.STATUSES.VALIDE,
      locales: ['fr'],
      skillId,
      genealogy: Challenge.GENEALOGIES.DECLINAISON,
      author: ['BOU'],
      version: 3,
      alternativeVersion: 1,
      airtableId: 'challengeProtoValideDecliValideAirtableId',
      updatedAt: new Date('2021-10-04'),
      localizedChallenges: [
        domainBuilder.buildLocalizedChallenge({
          id: 'challengeProtoValideDecliValideId',
          challengeId: 'challengeProtoValideDecliValideId',
          locale: 'fr',
        }),
        domainBuilder.buildLocalizedChallenge({
          id: 'challengeProtoValideDecliValideNlId',
          challengeId: 'challengeProtoValideDecliValideId',
          locale: 'nl',
        }),
      ],
      translations: {},
    });
    logger = {
      warn: vi.fn(),
    };
    challengeRepository = {
      listBySkillId: vi.fn(),
    };
    dependencies = {
      challengeRepository,
      logger,
    };
  });

  describe('when skill has a validated proto', function() {
    describe('when proto has alternatives', function() {
      it('should return only localized challenges for proto and its alternatives', async () => {
        // given
        challenges = [
          challengeProtoPerime,
          challengeProtoPropose,
          challengeProtoPerimeDecliPerime,
          challengeProtoValideDecliValide,
          challengeProtoProposeDecliPropose,
          challengeProtoArchive,
          challengeProtoValide,
          challengeProtoArchiveDecliArchive,
          challengeProtoValideDecliPerime,
        ];
        challengeRepository.listBySkillId.mockResolvedValue(challenges);

        // when
        const result = await getSkillLocalizedChallengesProduction({ skillId, dependencies });

        // then
        expect(challengeRepository.listBySkillId).toHaveBeenCalledWith(skillId);
        expect(result.map(({ id }) => id)).toStrictEqual([
          'challengeProtoValideEsId',
          'challengeProtoValideId',
          'challengeProtoValideDecliValideId',
          'challengeProtoValideDecliValideNlId',
          'challengeProtoValideDecliPerimeId',
          'challengeProtoValideDecliPerimeItId',
        ]);
        expect(logger.warn).not.toHaveBeenCalled();
      });
    });
    describe('when proto has no alternative', function() {
      it('should return an array containing all localized challenges for the proto only', async function() {
        // given
        challenges = [
          challengeProtoPerime,
          challengeProtoPropose,
          challengeProtoPerimeDecliPerime,
          challengeProtoProposeDecliPropose,
          challengeProtoArchive,
          challengeProtoValide,
        ];
        challengeRepository.listBySkillId.mockResolvedValue(challenges);

        // when
        const result = await getSkillLocalizedChallengesProduction({ skillId, dependencies });

        // then
        expect(result.map(({ id }) => id)).toStrictEqual(['challengeProtoValideEsId', 'challengeProtoValideId']);
        expect(challengeRepository.listBySkillId).toHaveBeenCalledWith(skillId);
        expect(logger.warn).not.toHaveBeenCalled();
      });
    });
  });

  describe('when skill has no validated proto', function() {
    it('should return an empty array and display a warn log', async () => {
      // given
      challenges = [
        challengeProtoPerime,
        challengeProtoPropose,
        challengeProtoPerimeDecliPerime,
      ];
      challengeRepository.listBySkillId.mockResolvedValue(challenges);

      // when
      const result = await getSkillLocalizedChallengesProduction({ skillId, dependencies });

      // then
      expect(challengeRepository.listBySkillId).toHaveBeenCalledWith(skillId);
      expect(logger.warn).toHaveBeenCalledWith(`usecase: getSkillLocalizedChallengesProduction. Pas de proto validé pour acquis "${skillId}"`);
      expect(result).toStrictEqual([]);
    });
  });

  describe('when skill has no challenges at all', function() {
    it('should return an empty array and display a warn log', async () => {
      // given
      challengeRepository.listBySkillId.mockResolvedValue([]);

      // when
      const result = await getSkillLocalizedChallengesProduction({ skillId, dependencies });

      // then
      expect(challengeRepository.listBySkillId).toHaveBeenCalledWith(skillId);
      expect(logger.warn).toHaveBeenCalledWith(`usecase: getSkillLocalizedChallengesProduction. Pas de proto validé pour acquis "${skillId}"`);
      expect(result).toStrictEqual([]);
    });
  });
});
