import { describe, expect, it, vi } from 'vitest';
import * as challengeRepository from '../../../../lib/infrastructure/repositories/challenge-repository.js';
import { challengeDatasource } from '../../../../lib/infrastructure/datasources/airtable/index.js';
import {
  localizedChallengeRepository,
  translationRepository
} from '../../../../lib/infrastructure/repositories/index.js';
import { domainBuilder } from '../../../test-helper.js';

const { filter } = challengeRepository;

describe('Unit | Repository | challenge-repository', () => {
  describe('#filter', () => {
    describe('when ids are specified', () => {
      it('should return challenges with given ids', async () => {
        // given
        vi.spyOn(challengeDatasource, 'filter').mockResolvedValue([
          { id: '1', locales: ['fr'], geography: 'XX' },
          { id: '2', locales: ['fr'], geography: 'XX' },
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
          geography: 'AA',
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
        expect(challenges[0].geography).to.equal('BR');
        expect(challenges[1].instruction).to.equal('instruction 2');
        expect(challenges[1].proposals).to.equal('proposals 2');
        expect(challenges[1].alternativeLocales).to.deep.equal([]);
        expect(challenges[1].localizedChallenges).to.deep.equal([localizedChallenge2]);
        expect(challenges[1].geography).to.equal('PH');
        expect(challengeDatasource.filter).toHaveBeenCalledWith({ filter: { ids: ['1', '2'] } });
        expect(translationRepository.listByEntities).toHaveBeenCalledWith('challenge', ['1', '2']);
        expect(localizedChallengeRepository.listByChallengeIds).toHaveBeenCalledWith({ challengeIds: ['1', '2'] });
      });

      it('should return challenges with empty fields when have no translation', async () => {
        // given
        vi.spyOn(challengeDatasource, 'filter').mockResolvedValue([{ id: 1, locales: [], geography: 'XX' }]);
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
        expect(challenges[0].geography).to.equal('BR');
      });

      it('should return challenges with empty fields when locale translations are not available', async () => {
        // given
        vi.spyOn(challengeDatasource, 'filter').mockResolvedValue([{ id: 1, locales: ['en'], geography: 'XX' }]);
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
        expect(challenges[0].geography).to.equal('BR');
      });
    });

    describe('when ids and search are not specified', () => {
      it('should return all challenges', async () => {
        // given
        vi.spyOn(challengeDatasource, 'filter');
        vi.spyOn(challengeDatasource, 'list').mockResolvedValue([
          { id: '1', locales: ['fr'], geography: 'XX' },
          { id: '2', locales: ['en'], geography: 'XX' },
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
          { id: 'challengeId1', locales: ['fr'], geography: 'XX' },
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
        expect(challenges[0].geography).to.equal('BR');
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
});
