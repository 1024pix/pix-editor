import { describe, expect, it, vi } from 'vitest';
import * as challengeRepository from '../../../../lib/infrastructure/repositories/challenge-repository.js';
import { challengeDatasource } from '../../../../lib/infrastructure/datasources/airtable/index.js';
import {
  localizedChallengeRepository,
  translationRepository
} from '../../../../lib/infrastructure/repositories/index.js';
import { domainBuilder } from '../../../test-helper.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';
import { LocalizedChallenge } from '../../../../lib/domain/models/index.js';

const { filter, get, list, update } = challengeRepository;

describe('Unit | Repository | challenge-repository', () => {
  describe('#list', () => {
    it('should return all challenges', async () => {
      // given
      vi.spyOn(translationRepository, 'listByModel')
        .mockResolvedValueOnce([{
          key: 'challenge.1.instruction',
          value: 'instruction',
          locale: 'fr'
        }, {
          key: 'challenge.1.proposals',
          value: 'proposals',
          locale: 'fr'
        }, {
          key: 'challenge.2.instruction',
          value: 'instruction 2',
          locale: 'fr'
        }, {
          key: 'challenge.2.proposals',
          value: 'proposals 2',
          locale: 'fr'
        }].map(domainBuilder.buildTranslation));
      vi.spyOn(localizedChallengeRepository, 'list').mockResolvedValueOnce([
        domainBuilder.buildLocalizedChallenge({
          id: '1',
          challengeId: '1',
          locale: 'fr',
          geography: 'PH',
          requireGafamWebsiteAccess: true,
          isIncompatibleIpadCertif: true,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
          isAwarenessChallenge: true,
          toRephrase: true,
        }),
        domainBuilder.buildLocalizedChallenge({
          id: '1_en',
          challengeId: '1',
          locale: 'en',
          geography: 'LA',
          requireGafamWebsiteAccess: false,
          isIncompatibleIpadCertif: false,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.RAS,
          isAwarenessChallenge: false,
          toRephrase: false,
        }),
        domainBuilder.buildLocalizedChallenge({
          id: '2',
          challengeId: '2',
          locale: 'fr',
          geography: 'BR',
          requireGafamWebsiteAccess: false,
          isIncompatibleIpadCertif: true,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
          isAwarenessChallenge: true,
          toRephrase: false,
        }),
      ]);
      vi.spyOn(challengeDatasource, 'list').mockResolvedValue([{ id: 1, locales: [], geography: 'DeprecatedLand' }, { id: 2, locales: [], geography: 'DeprecatedLand' }]);

      // when
      const challenges = await list();

      // then
      expect(challenges.length).to.equal(2);
      expect(challengeDatasource.list).toHaveBeenCalled();
      expect(translationRepository.listByModel).toHaveBeenCalledWith('challenge');
      expect(localizedChallengeRepository.list).toHaveBeenCalled();
      expect(challenges[0].instruction).to.equal('instruction');
      expect(challenges[0].proposals).to.equal('proposals');
      expect(challenges[0].alternativeLocales).to.deep.equal(['en']);
      expect(challenges[0].geography).to.equal('Philippines');
      expect(challenges[0].requireGafamWebsiteAccess).to.equal(true);
      expect(challenges[0].isIncompatibleIpadCertif).to.equal(true);
      expect(challenges[0].deafAndHardOfHearing).to.equal(LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK);
      expect(challenges[0].isAwarenessChallenge).to.equal(true);
      expect(challenges[0].toRephrase).to.equal(true);

      expect(challenges[1].instruction).to.equal('instruction 2');
      expect(challenges[1].proposals).to.equal('proposals 2');
      expect(challenges[1].alternativeLocales).to.deep.equal([]);
      expect(challenges[1].geography).to.equal('Brésil');
      expect(challenges[1].requireGafamWebsiteAccess).to.equal(false);
      expect(challenges[1].isIncompatibleIpadCertif).to.equal(true);
      expect(challenges[1].deafAndHardOfHearing).to.equal(LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO);
      expect(challenges[1].isAwarenessChallenge).to.equal(true);
      expect(challenges[1].toRephrase).to.equal(false);

    });
  });
  describe('#filter', () => {
    describe('when ids are specified', () => {
      it('should return challenges with given ids', async () => {
        // given
        vi.spyOn(challengeDatasource, 'filter').mockResolvedValue([
          { id: '1', locales: ['fr'], geography: 'DeprecatedLand' },
          { id: '2', locales: ['fr'], geography: 'DeprecatedLand' },
        ]);
        vi.spyOn(translationRepository, 'listByEntities')
          .mockResolvedValueOnce([{
            key: 'challenge.1.instruction',
            value: 'instruction',
            locale: 'fr'
          }, {
            key: 'challenge.1.instruction',
            value: 'instruction en anglais',
            locale: 'en'
          }, {
            key: 'challenge.1.proposals',
            value: 'proposals',
            locale: 'fr'
          }, {
            key: 'challenge.2.instruction',
            value: 'instruction 2',
            locale: 'fr'
          }, {
            key: 'challenge.2.proposals',
            value: 'proposals 2',
            locale: 'fr'
          }].map(domainBuilder.buildTranslation));

        const localizedChallenge1 = domainBuilder.buildLocalizedChallenge({
          id: '1',
          challengeId: '1',
          locale: 'fr',
          geography: 'BR',
        });
        const localizedChallenge1_en = domainBuilder.buildLocalizedChallenge({
          id: '1_en',
          challengeId: '1',
          locale: 'en',
          geography: null,
        });
        const localizedChallenge2 = domainBuilder.buildLocalizedChallenge({
          id: '2',
          challengeId: '2',
          locale: 'fr',
          geography: 'PH',
        });

        vi.spyOn(localizedChallengeRepository, 'listByChallengeIds').mockResolvedValueOnce([
          localizedChallenge1,
          localizedChallenge1_en,
          localizedChallenge2,
        ]);

        // when
        const challenges = await filter({ filter: { ids: ['1', '2'] } });

        // then
        expect(challenges.length).to.equal(2);
        expect(challenges[0].instruction).to.equal('instruction');
        expect(challenges[0].proposals).to.equal('proposals');
        expect(challenges[0].alternativeLocales).to.deep.equal(['en']);
        expect(challenges[0].localizedChallenges).to.deep.equal([localizedChallenge1, localizedChallenge1_en]);
        expect(challenges[0].geography).to.equal('Brésil');
        expect(challenges[1].instruction).to.equal('instruction 2');
        expect(challenges[1].proposals).to.equal('proposals 2');
        expect(challenges[1].alternativeLocales).to.deep.equal([]);
        expect(challenges[1].localizedChallenges).to.deep.equal([localizedChallenge2]);
        expect(challenges[1].geography).to.equal('Philippines');
        expect(challengeDatasource.filter).toHaveBeenCalledWith({ filter: { ids: ['1', '2'] } });
        expect(translationRepository.listByEntities).toHaveBeenCalledWith('challenge', ['1', '2']);
        expect(localizedChallengeRepository.listByChallengeIds).toHaveBeenCalledWith({ challengeIds: ['1', '2'] });
      });

      it('should return challenges with empty fields when have no translation', async () => {
        // given
        vi.spyOn(challengeDatasource, 'filter').mockResolvedValue([{ id: 1, locales: [], geography: 'DeprecatedLand' }]);
        vi.spyOn(translationRepository, 'listByEntities')
          .mockResolvedValueOnce([{
            key: 'challenge.1.proposals',
            value: 'proposals',
            locale: 'fr'
          }].map(domainBuilder.buildTranslation));
        vi.spyOn(localizedChallengeRepository, 'listByChallengeIds').mockResolvedValueOnce([
          domainBuilder.buildLocalizedChallenge({
            id: '1',
            challengeId: '1',
            locale: 'fr',
            geography: 'BR',
          }),
        ]);

        // when
        const challenges = await filter({ filter: { ids: ['1'] } });

        // then
        expect(challenges.length).to.equal(1);
        expect(challenges[0].instruction).to.equal('');
        expect(challenges[0].proposals).to.equal('proposals');
        expect(challenges[0].geography).to.equal('Brésil');
      });

      it('should return challenges with empty fields when locale translations are not available', async () => {
        // given
        vi.spyOn(challengeDatasource, 'filter').mockResolvedValue([{ id: 1, locales: ['en'], geography: 'DeprecatedLand' }]);
        vi.spyOn(translationRepository, 'listByEntities')
          .mockResolvedValueOnce([{
            key: 'challenge.1.proposals',
            value: 'proposals',
            locale: 'fr'
          }]);
        vi.spyOn(localizedChallengeRepository, 'listByChallengeIds').mockResolvedValueOnce([
          domainBuilder.buildLocalizedChallenge({
            id: '1',
            challengeId: '1',
            locale: 'en',
            geography: 'BR',
          }),
        ]);

        // when
        const challenges = await filter({ filter: { ids: ['1'] } });

        // then
        expect(challenges.length).to.equal(1);
        expect(challenges[0].proposals).to.equal('');
        expect(challenges[0].geography).to.equal('Brésil');
      });
    });

    describe('when ids and search are not specified', () => {
      it('should return all challenges', async () => {
        // given
        vi.spyOn(challengeDatasource, 'filter');
        vi.spyOn(challengeDatasource, 'list').mockResolvedValue([
          { id: '1', locales: ['fr'], geography: 'DeprecatedLand' },
          { id: '2', locales: ['en'], geography: 'DeprecatedLand' },
        ]);
        vi.spyOn(localizedChallengeRepository, 'listByChallengeIds').mockResolvedValueOnce([
          domainBuilder.buildLocalizedChallenge({
            id: '1',
            challengeId: '1',
            locale: 'fr',
            geography: 'BR',
          }),
          domainBuilder.buildLocalizedChallenge({
            id: '2',
            challengeId: '2',
            locale: 'en',
            geography: 'PH',
          }),
        ]);

        // when
        const challenges = await filter({ page: { size: 20 } });

        // then
        expect(challenges.length).to.equal(2);
        expect(challengeDatasource.filter).not.toHaveBeenCalled();
        expect(challengeDatasource.list).toHaveBeenCalledWith({ page: { size: 20 } });
      });
    });

    describe('when search is specified', () => {
      it('should search challenges according to filters', async () => {
        // given
        vi.spyOn(translationRepository, 'search').mockResolvedValueOnce(['challengeId1']);
        vi.spyOn(challengeDatasource, 'search').mockResolvedValue([
          { id: 'challengeId1', locales: ['fr'], geography: 'DeprecatedLand' },
        ]);
        vi.spyOn(localizedChallengeRepository, 'listByChallengeIds').mockResolvedValueOnce([
          domainBuilder.buildLocalizedChallenge({
            id: 'challengeId1',
            challengeId: 'challengeId1',
            locale: 'fr',
            geography: 'BR',
          }),
        ]);

        // when
        const challenges = await filter({ filter: { search: 'toto' }, page: { size: 'limit' } });

        // then
        expect(challenges.length).to.equal(1);
        expect(challenges[0].geography).to.equal('Brésil');
        expect(translationRepository.search).toHaveBeenCalledWith({
          entity: 'challenge',
          fields: ['instruction', 'proposals'],
          search: 'toto',
          limit: 'limit',
        });

        expect(challengeDatasource.search).toHaveBeenCalledWith({
          filter: { search: 'toto', ids: ['challengeId1'] },
          page: { size: 'limit' }
        });
      });
    });

    describe('when no challenges match the params', () => {
      it('should return an empty array w/o loading translations and localized challenges', async () => {
        // given
        vi.spyOn(challengeDatasource, 'filter').mockResolvedValue([]);
        vi.spyOn(translationRepository, 'listByEntities');
        vi.spyOn(localizedChallengeRepository, 'listByChallengeIds');

        // when
        const challenges = await filter({ filter: { ids: ['unknown id'] } });

        // then
        expect(challenges).to.deep.equal([]);
        expect(translationRepository.listByEntities).not.toHaveBeenCalled();
        expect(localizedChallengeRepository.listByChallengeIds).not.toHaveBeenCalled();
      });
    });
  });
  describe('#filterByThematicIds', () => {
    it('calls filter with filterByFormula defined to filter by thematic ids', async function() {
      const thematicsIds = ['id1', 'id2'];
      vi.spyOn(challengeDatasource, 'filter').mockResolvedValue([]);
      vi.spyOn(translationRepository, 'listByEntities');
      vi.spyOn(localizedChallengeRepository, 'listByChallengeIds');

      await challengeRepository.filterByThematicIds(thematicsIds);

      expect(challengeDatasource.filter).toHaveBeenCalledWith({ filter : { formula: 'OR(FIND("id1", {Thematique (Record ID)}), FIND("id2", {Thematique (Record ID)}))' } });
    });
  });
  describe('#get', () => {
    it('should return a challenge by id', async () => {
      // given
      const locale = 'en';
      const primaryLocale = 'fr';
      const challengeId = 'challengeId';
      const challengeFromAirtable = domainBuilder.buildChallengeDatasourceObject({
        id: challengeId,
        locales: [primaryLocale],
        geography: 'DeprecatedLand',
      });
      const expectedChallenge = domainBuilder.buildChallenge({
        ...challengeFromAirtable,
        locales: [primaryLocale],
        translations: {
          [primaryLocale]: {
            instruction: 'instruction fr',
            proposals: 'proposals fr',
          },
          [locale]: {
            instruction: 'instruction en',
            proposals: 'proposals en',
          },
        },
        localizedChallenges: [domainBuilder.buildLocalizedChallenge({ geography: 'BR' })],
        geography: 'Brésil',
      });

      vi.spyOn(localizedChallengeRepository, 'listByChallengeIds').mockResolvedValueOnce(expectedChallenge.localizedChallenges);
      vi.spyOn(challengeDatasource, 'filterById').mockResolvedValue(challengeFromAirtable);
      vi.spyOn(translationRepository, 'listByEntity')
        .mockResolvedValueOnce([{
          key: `challenge.${challengeId}.instruction`,
          value: 'instruction fr',
          locale: primaryLocale,
        }, {
          key: `challenge.${challengeId}.proposals`,
          value: 'proposals fr',
          locale: primaryLocale,
        }, {
          key: `challenge.${challengeId}.instruction`,
          value: 'instruction en',
          locale
        }, {
          key: `challenge.${challengeId}.proposals`,
          value: 'proposals en',
          locale
        }]);

      // when
      const result = await get(challengeId);

      // then
      expect(challengeDatasource.filterById).toHaveBeenCalledWith(challengeId);
      expect(translationRepository.listByEntity).toHaveBeenCalledWith('challenge', challengeId);
      expect(localizedChallengeRepository.listByChallengeIds).toHaveBeenCalledWith({ challengeIds: [challengeId] });
      expect(result).toEqual(expectedChallenge);
    });

    describe('when challenge does not exist', () => {
      it('should throw a NotFoundError', async () => {
        // given
        const challengeId = 'challengeId';
        vi.spyOn(challengeDatasource, 'filterById').mockResolvedValue(undefined);

        // when
        const promise = get(challengeId);

        await expect(promise).rejects.to.deep.equal(new NotFoundError('Épreuve introuvable'));
        expect(challengeDatasource.filterById).toHaveBeenCalledWith(challengeId);
      });
    });
  });
  describe('#update', () => {
    it('should update a challenge by id', async () => {
      // given
      const locale = 'en';
      const oldPrimaryLocale = 'fr';
      const newPrimaryLocale = 'es';
      const oldEmbedUrl = 'old embed url';
      const newEmbedUrl = 'new embed url';
      const oldGeography = 'FR';
      const newGeography = 'ES';
      const oldUrlsToConsult = 'old UrlsToConsult';
      const newUrlsToConsult = 'new UrlsToConsult';
      const oldRequireGafamWebsiteAccess = false;
      const newRequireGafamWebsiteAccess = true;
      const oldIsIncompatibleIpadCertif = false;
      const newIsIncompatibleIpadCertif = true;
      const oldDeafAndHardOfHearing = LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK;
      const newDeafAndHardOfHearing = LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO;
      const oldIsAwarenessChallenge = false;
      const newIsAwarenessChallenge = true;
      const oldToRephrase = false;
      const newToRephrase = true;
      const challengeId = 'challengeId';
      const challengeFromAirtable = domainBuilder.buildChallengeDatasourceObject({
        id: challengeId,
        locales: [oldPrimaryLocale]
      });
      const localizedChallenge_originalData = {
        id: challengeId,
        challengeId,
        status: null,
        locale: oldPrimaryLocale,
        embedUrl: oldEmbedUrl,
        geography: oldGeography,
        urlsToConsult: oldUrlsToConsult,
        requireGafamWebsiteAccess: oldRequireGafamWebsiteAccess,
        isIncompatibleIpadCertif: oldIsIncompatibleIpadCertif,
        deafAndHardOfHearing: oldDeafAndHardOfHearing,
        isAwarenessChallenge: oldIsAwarenessChallenge,
        toRephrase: oldToRephrase,
      };
      const localizedChallengesInDb = [
        domainBuilder.buildLocalizedChallenge(localizedChallenge_originalData),
        domainBuilder.buildLocalizedChallenge({
          id: 'localizedChallengeId',
          challengeId,
          locale,
          requireGafamWebsiteAccess: false,
          isIncompatibleIpadCertif: true,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
          isAwarenessChallenge: false,
          toRephrase: true,
        }),
      ];
      const challengeToUpdate = domainBuilder.buildChallenge({
        ...challengeFromAirtable,
        locales: [newPrimaryLocale],
        translations: {
          [newPrimaryLocale]: {
            instruction: 'instruction es',
            proposals: 'proposals es',
          },
        },
        localizedChallenges: [
          domainBuilder.buildLocalizedChallenge({
            id: challengeId,
            challengeId,
            locale: newPrimaryLocale,
            embedUrl: newEmbedUrl,
            geography: newGeography,
            urlsToConsult: newUrlsToConsult,
            requireGafamWebsiteAccess: newRequireGafamWebsiteAccess,
            isIncompatibleIpadCertif: newIsIncompatibleIpadCertif,
            deafAndHardOfHearing: newDeafAndHardOfHearing,
            isAwarenessChallenge: newIsAwarenessChallenge,
            toRephrase: newToRephrase,
          }),
        ],
      });

      vi.spyOn(challengeDatasource, 'update').mockResolvedValue({ ...challengeFromAirtable, locales: [newPrimaryLocale] });
      vi.spyOn(localizedChallengeRepository, 'listByChallengeIds').mockResolvedValueOnce(localizedChallengesInDb);
      vi.spyOn(localizedChallengeRepository, 'update').mockResolvedValueOnce();
      vi.spyOn(translationRepository, 'save').mockResolvedValueOnce();
      vi.spyOn(translationRepository, 'deleteByKeyPrefixAndLocales').mockResolvedValueOnce();

      // when
      const result = await update(challengeToUpdate);

      // then
      expect(challengeDatasource.update).toHaveBeenCalledWith(challengeToUpdate);
      expect(localizedChallengeRepository.listByChallengeIds).toHaveBeenCalledWith({ challengeIds: [challengeId], transaction: expect.anything() });
      expect(localizedChallengeRepository.update).toHaveBeenCalledWith({
        localizedChallenge: domainBuilder.buildLocalizedChallenge({
          ...localizedChallenge_originalData,
          locale: newPrimaryLocale,
          embedUrl: newEmbedUrl,
          geography: newGeography,
          urlsToConsult: newUrlsToConsult,
          requireGafamWebsiteAccess: newRequireGafamWebsiteAccess,
          isIncompatibleIpadCertif: newIsIncompatibleIpadCertif,
          deafAndHardOfHearing: newDeafAndHardOfHearing,
          isAwarenessChallenge: newIsAwarenessChallenge,
          toRephrase: newToRephrase,
        }),
        transaction: expect.anything(),
      });
      expect(translationRepository.deleteByKeyPrefixAndLocales).toHaveBeenCalledWith({
        prefix: 'challenge.challengeId.',
        locales: [oldPrimaryLocale],
        transaction: expect.anything(),
      });
      expect(translationRepository.save).toHaveBeenCalledWith({
        translations: [{
          key: `challenge.${challengeId}.instruction`,
          value: 'instruction es',
          locale: newPrimaryLocale,
        }, {
          key: `challenge.${challengeId}.proposals`,
          value: 'proposals es',
          locale: newPrimaryLocale,
        }],
        transaction: expect.anything(),
      });
      const expectedChallenge = domainBuilder.buildChallenge({
        ...challengeFromAirtable,
        locales: [newPrimaryLocale],
        translations: {
          [newPrimaryLocale]: {
            instruction: 'instruction es',
            proposals: 'proposals es',
          },
        },
        localizedChallenges: [
          domainBuilder.buildLocalizedChallenge({
            id: challengeId,
            challengeId,
            locale: newPrimaryLocale,
            embedUrl: newEmbedUrl,
            geography: newGeography,
            urlsToConsult: newUrlsToConsult,
            requireGafamWebsiteAccess: newRequireGafamWebsiteAccess,
            isIncompatibleIpadCertif: newIsIncompatibleIpadCertif,
            deafAndHardOfHearing: newDeafAndHardOfHearing,
            isAwarenessChallenge: newIsAwarenessChallenge,
            toRephrase: newToRephrase,
          }),
          domainBuilder.buildLocalizedChallenge({
            id: 'localizedChallengeId',
            challengeId,
            locale,
            requireGafamWebsiteAccess: false,
            isIncompatibleIpadCertif: true,
            deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
            isAwarenessChallenge: false,
            toRephrase: true,
          }),
        ],
      });
      expect(result).toEqual(expectedChallenge);
    });
  });
});
