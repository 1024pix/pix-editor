import { describe, expect, it, vi } from 'vitest';
import {
  createBatch,
  filter,
  get,
  list,
  update
} from '../../../../lib/infrastructure/repositories/challenge-repository.js';
import { challengeDatasource, skillDatasource } from '../../../../lib/infrastructure/datasources/airtable/index.js';
import {
  localizedChallengeRepository,
  translationRepository
} from '../../../../lib/infrastructure/repositories/index.js';
import { domainBuilder } from '../../../test-helper.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';

describe('Unit | Repository | challenge-repository', () => {
  describe('#list', () => {
    it('should return all challenges', async () => {
      // given
      vi.spyOn(translationRepository, 'listByPrefix')
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
        }),
        domainBuilder.buildLocalizedChallenge({
          id: '1_en',
          challengeId: '1',
          locale: 'en',
          geography: 'LA',
        }),
        domainBuilder.buildLocalizedChallenge({
          id: '2',
          challengeId: '2',
          locale: 'fr',
          geography: 'BR',
        }),
      ]);
      vi.spyOn(challengeDatasource, 'list').mockResolvedValue([{ id: 1, locales: [], geography: 'DeprecatedLand' }, { id: 2, locales: [], geography: 'DeprecatedLand' }]);

      // when
      const challenges = await list();

      // then
      expect(challenges.length).to.equal(2);
      expect(challengeDatasource.list).toHaveBeenCalled();
      expect(translationRepository.listByPrefix).toHaveBeenCalledWith('challenge.');
      expect(localizedChallengeRepository.list).toHaveBeenCalled();
      expect(challenges[0].instruction).to.equal('instruction');
      expect(challenges[0].proposals).to.equal('proposals');
      expect(challenges[0].alternativeLocales).to.deep.equal(['en']);
      expect(challenges[0].geography).to.equal('Philippines');
      expect(challenges[1].instruction).to.equal('instruction 2');
      expect(challenges[1].proposals).to.equal('proposals 2');
      expect(challenges[1].alternativeLocales).to.deep.equal([]);
      expect(challenges[1].geography).to.equal('Brésil');
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
        vi.spyOn(translationRepository, 'listByPrefix')
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
          }].map(domainBuilder.buildTranslation))
          .mockResolvedValueOnce([{
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
        expect(challenges[0].localizedChallenges).to.deep.equal([ localizedChallenge1, localizedChallenge1_en]);
        expect(challenges[0].geography).to.equal('Brésil');
        expect(challenges[1].instruction).to.equal('instruction 2');
        expect(challenges[1].proposals).to.equal('proposals 2');
        expect(challenges[1].alternativeLocales).to.deep.equal([]);
        expect(challenges[1].localizedChallenges).to.deep.equal([localizedChallenge2]);
        expect(challenges[1].geography).to.equal('Philippines');
        expect(challengeDatasource.filter).toHaveBeenCalledWith({ filter: { ids: ['1', '2'] } });
        expect(translationRepository.listByPrefix).toHaveBeenCalledWith('challenge.1.', { transaction: expect.anything() });
        expect(translationRepository.listByPrefix).toHaveBeenCalledWith('challenge.2.', { transaction: expect.anything() });
        expect(localizedChallengeRepository.listByChallengeIds).toHaveBeenCalledWith({ challengeIds: ['1', '2'], transaction: expect.anything() });
      });

      it('should return challenges with empty fields when have no translation', async () => {
        // given
        vi.spyOn(challengeDatasource, 'filter').mockResolvedValue([{ id: 1, locales: [], geography: 'DeprecatedLand' }]);
        vi.spyOn(translationRepository, 'listByPrefix')
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
        vi.spyOn(translationRepository, 'listByPrefix')
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
        vi.spyOn(translationRepository, 'listByPrefix');
        vi.spyOn(localizedChallengeRepository, 'listByChallengeIds');

        // when
        const challenges = await filter({ filter: { ids: ['unknown id'] } });

        // then
        expect(challenges).to.deep.equal([]);
        expect(translationRepository.listByPrefix).not.toHaveBeenCalled();
        expect(localizedChallengeRepository.listByChallengeIds).not.toHaveBeenCalled();
      });
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
      vi.spyOn(translationRepository, 'listByPrefix')
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
      expect(translationRepository.listByPrefix).toHaveBeenCalledWith(`challenge.${challengeId}.`);
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
      const primaryLocale = 'fr';
      const challengeId = 'challengeId';
      const challengeFromAirtable = domainBuilder.buildChallengeDatasourceObject({
        id: challengeId,
        locales: [primaryLocale]
      });
      const localizedChallenges = [
        domainBuilder.buildLocalizedChallenge({
          id: challengeId,
          challengeId,
          locale: primaryLocale,
        }),
        domainBuilder.buildLocalizedChallenge({
          id: 'localizedChallengeId',
          challengeId,
          locale,
        }),
      ];
      const challengeToUpdate = domainBuilder.buildChallenge({
        ...challengeFromAirtable,
        locales: [primaryLocale],
        translations: {
          [primaryLocale]: {
            instruction: 'instruction fr',
            proposals: 'proposals fr',
          },
        },
        localizedChallenges,
      });

      vi.spyOn(challengeDatasource, 'update').mockResolvedValue(challengeFromAirtable);
      vi.spyOn(localizedChallengeRepository, 'listByChallengeIds').mockResolvedValueOnce(localizedChallenges);
      vi.spyOn(localizedChallengeRepository, 'update').mockResolvedValueOnce();
      vi.spyOn(translationRepository, 'save').mockResolvedValueOnce();
      vi.spyOn(translationRepository, 'deleteByKeyPrefixAndLocales').mockResolvedValueOnce();

      // when
      const result = await update(challengeToUpdate);

      // then
      expect(challengeDatasource.update).toHaveBeenCalledWith(challengeToUpdate);
      expect(localizedChallengeRepository.listByChallengeIds).toHaveBeenCalledWith({ challengeIds: [challengeId], transaction: expect.anything() });
      expect(localizedChallengeRepository.update).toHaveBeenCalledWith({ localizedChallenge: localizedChallenges[0], transaction: expect.anything() });
      expect(translationRepository.deleteByKeyPrefixAndLocales).toHaveBeenCalledWith({
        prefix: 'challenge.challengeId.',
        locales: [primaryLocale],
        transaction: expect.anything(),
      });
      expect(translationRepository.save).toHaveBeenCalledWith({
        translations: [{
          key: `challenge.${challengeId}.instruction`,
          value: 'instruction fr',
          locale: primaryLocale,
        }, {
          key: `challenge.${challengeId}.proposals`,
          value: 'proposals fr',
          locale: primaryLocale,
        }],
        transaction: expect.anything(),
      });
      expect(result).toEqual(challengeToUpdate);
    });
  });
  describe('#createBatch', () => {
    it('should return an empty array when there is no challenge to save', async () => {
      // given
      const challenges = [];

      // when
      const result = await createBatch(challenges);

      // then
      expect(result).toStrictEqual([]);
    });

    it('should save several challenges', async () => {
      // given
      const airtableIdsByIds = {
        'skillIdPersistantA': 'airtableSkillIdA',
        'skillIdPersistantB': 'airtableSkillIdB',
      };

      const challengeIdA = 'challengeIdA';
      const challengeIdB = 'challengeIdB';

      const localizedChallenges1 = [
        domainBuilder.buildLocalizedChallenge({
          id: challengeIdA,
          challengeId: challengeIdA,
          locale: 'fr',
        }),
        domainBuilder.buildLocalizedChallenge({
          id: 'localizedChallengeIdA',
          challengeId: challengeIdA,
          locale: 'nl',
        }),
      ];

      const localizedChallenges2 = [
        domainBuilder.buildLocalizedChallenge({
          id: challengeIdB,
          challengeId: challengeIdB,
          locale: 'fr',
        }),
        domainBuilder.buildLocalizedChallenge({
          id: 'localizedChallengeIdB',
          challengeId: challengeIdB,
          locale: 'nl',
        }),
      ];
      const challengesToCreate = [
        domainBuilder.buildChallenge({
          skillId: 'skillIdPersistantA',
          locales: ['fr'],
          translations: {
            fr: {
              instruction: 'instruction A fr',
              proposals: 'proposals A fr',
            },
            nl: {
              instruction: 'instruction A nl',
              proposals: 'proposals A nl',
            },
          },
          localizedChallenges: localizedChallenges1,
        }), domainBuilder.buildChallenge({
          skillId: 'skillIdPersistantB',
          locales: ['fr'],
          translations: {
            fr: {
              instruction: 'instruction B fr',
              proposals: 'proposals B fr',
            },
            nl: {
              instruction: 'instruction B nl',
              proposals: 'proposals B nl',
            },
          },
          localizedChallenges: localizedChallenges2,
        })
      ];

      vi.spyOn(skillDatasource, 'getAirtableIdsByIds').mockImplementation(() => airtableIdsByIds);
      vi.spyOn(challengeDatasource, 'createBatch').mockImplementation(() => challengesToCreate.map(domainBuilder.buildChallengeDatasourceObject));
      vi.spyOn(localizedChallengeRepository, 'create');
      vi.spyOn(translationRepository, 'save').mockImplementation(() => 'savedTranslations');

      // when
      await createBatch(challengesToCreate);

      // then
      const expectedTranslations = [
        domainBuilder.buildTranslation({
          key: `challenge.${challengeIdA}.instruction`,
          locale: 'fr',
          value: 'instruction A fr'
        }),domainBuilder.buildTranslation({
          key: `challenge.${challengeIdA}.proposals`,
          locale: 'fr',
          value: 'proposals A fr'
        }), domainBuilder.buildTranslation({
          key: `challenge.${challengeIdA}.instruction`,
          locale: 'nl',
          value: 'instruction A nl'
        }),domainBuilder.buildTranslation({
          key: `challenge.${challengeIdA}.proposals`,
          locale: 'nl',
          value: 'proposals A nl'
        }), domainBuilder.buildTranslation({
          key: `challenge.${challengeIdB}.instruction`,
          locale: 'fr',
          value: 'instruction B fr'
        }),domainBuilder.buildTranslation({
          key: `challenge.${challengeIdB}.proposals`,
          locale: 'fr',
          value: 'proposals B fr'
        }), domainBuilder.buildTranslation({
          key: `challenge.${challengeIdB}.instruction`,
          locale: 'nl',
          value: 'instruction B nl'
        }),domainBuilder.buildTranslation({
          key: `challenge.${challengeIdB}.proposals`,
          locale: 'nl',
          value: 'proposals B nl'
        }),
      ];

      expect(localizedChallengeRepository.create).toHaveBeenCalledWith({ localizedChallenges: [...localizedChallenges1, ...localizedChallenges2], transaction: expect.anything() });
      expect(translationRepository.save).toHaveBeenCalledWith({ translations: expectedTranslations, transaction: expect.anything() });
    });
  });
});
