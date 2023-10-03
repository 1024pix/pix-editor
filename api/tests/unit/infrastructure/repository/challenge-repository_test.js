import { describe, expect, it, vi } from 'vitest';
import { create, filter, list } from '../../../../lib/infrastructure/repositories/challenge-repository.js';
import { challengeDatasource } from '../../../../lib/infrastructure/datasources/airtable/challenge-datasource.js';
import { translationRepository } from '../../../../lib/infrastructure/repositories/index.js';

describe('Unit | Repository | challenge-repository', () => {

  describe('#list', () => {
    it('should return all challenges',  async () => {
      // given
      vi.spyOn(translationRepository, 'listByPrefix')
        .mockResolvedValueOnce([{
          key: 'challenge.1.instruction',
          value: 'instruction',
          locale: 'fr'
        },{
          key: 'challenge.1.proposals',
          value: 'proposals',
          locale: 'fr'
        }, {
          key: 'challenge.2.instruction',
          value: 'instruction 2',
          locale: 'fr'
        },{
          key: 'challenge.2.proposals',
          value: 'proposals 2',
          locale: 'fr'
        }]);
      vi.spyOn(challengeDatasource, 'list').mockResolvedValue([{ id: 1, locales: [] },{ id: 2, locales: [] }]);

      // when
      const challenges = await list();

      // then
      expect(challenges.length).equal(2);
      expect(challengeDatasource.list).toHaveBeenCalled();
      expect(translationRepository.listByPrefix).toHaveBeenCalledWith('challenge.');
      expect(challenges[0].instruction).to.equal('instruction');
      expect(challenges[0].proposals).to.equal('proposals');
      expect(challenges[1].instruction).to.equal('instruction 2');
      expect(challenges[1].proposals).to.equal('proposals 2');
    });
  });

  describe('#filter', () => {
    describe('when ids are specified', () => {
      it('should return challenges with given ids',  async () => {
        // given
        vi.spyOn(challengeDatasource, 'filter').mockResolvedValue([{ id: 1, locales: [] },{ id: 2, locales: [] }]);
        vi.spyOn(translationRepository, 'listByPrefix')
          .mockResolvedValueOnce([{
            key: 'challenge.1.instruction',
            value: 'instruction',
            locale: 'fr'
          },{
            key: 'challenge.1.proposals',
            value: 'proposals',
            locale: 'fr'
          }])
          .mockResolvedValueOnce([{
            key: 'challenge.2.instruction',
            value: 'instruction 2',
            locale: 'fr'
          },{
            key: 'challenge.2.proposals',
            value: 'proposals 2',
            locale: 'fr'
          }]);

        // when
        const challenges = await filter({ filter: { ids: ['1', '2'] } });

        // then
        expect(challenges.length).equal(2);
        expect(challenges[0].instruction).to.equal('instruction');
        expect(challenges[0].proposals).to.equal('proposals');
        expect(challenges[1].instruction).to.equal('instruction 2');
        expect(challenges[1].proposals).to.equal('proposals 2');
        expect(challengeDatasource.filter).toHaveBeenCalledWith({ filter: { ids: ['1', '2'] } });
        expect(translationRepository.listByPrefix).toHaveBeenCalledWith('challenge.1.', { transaction: expect.anything() });
        expect(translationRepository.listByPrefix).toHaveBeenCalledWith('challenge.2.', { transaction: expect.anything() });
      });

      it('should return challenges with empty fields when have no translation',  async () => {
        // given
        vi.spyOn(challengeDatasource, 'filter').mockResolvedValue([{ id: 1, locales: [] }]);
        vi.spyOn(translationRepository, 'listByPrefix')
          .mockResolvedValueOnce([{
            key: 'challenge.1.proposals',
            value: 'proposals',
            locale: 'fr'
          }]);

        // when
        const challenges = await filter({ filter: { ids: ['1'] } });

        // then
        expect(challenges.length).equal(1);
        expect(challenges[0].instruction).to.equal('');
        expect(challenges[0].proposals).to.equal('proposals');
      });

      it('should return challenges with empty fields when locale translations are not available', async () => {
        // given
        vi.spyOn(challengeDatasource, 'filter').mockResolvedValue([{ id: 1, locales: ['en'] }]);
        vi.spyOn(translationRepository, 'listByPrefix')
          .mockResolvedValueOnce([{
            key: 'challenge.1.proposals',
            value: 'proposals',
            locale: 'fr'
          }]);

        // when
        const challenges = await filter({ filter: { ids: ['1'] } });

        // then
        expect(challenges.length).equal(1);
        expect(challenges[0].proposals).to.equal('');
      });
    });

    describe('when ids and search are not specified', () => {
      it('should return all challenges',  async () => {
        // given
        vi.spyOn(challengeDatasource, 'filter').mockResolvedValue([{},{}]);
        vi.spyOn(challengeDatasource, 'list').mockResolvedValue([{ locales: [] },{ locales: [] }]);

        // when
        const challenges = await filter({ page: { size: 20 } });

        // then
        expect(challenges.length).equal(2);
        expect(challengeDatasource.filter).not.toHaveBeenCalled();
        expect(challengeDatasource.list).toHaveBeenCalledWith({ page: { size: 20 } });
      });
    });

    describe('when search is specified', () => {
      it('should search challenges according to filters',  async () => {
        // given
        vi.spyOn(challengeDatasource, 'filter').mockResolvedValue([{},{}]);
        vi.spyOn(challengeDatasource, 'list').mockResolvedValue([{},{}]);
        vi.spyOn(challengeDatasource, 'search').mockResolvedValue([{ locales: [] },{ locales: [] }]);

        // when
        const challenges = await filter({ filter: { search: 'toto' } });

        // then
        expect(challenges.length).equal(2);
        expect(challengeDatasource.filter).not.toHaveBeenCalled();
        expect(challengeDatasource.list).not.toHaveBeenCalled();
        expect(challengeDatasource.search).toHaveBeenCalledWith({ filter: { search: 'toto' } });
      });
    });
  });

  describe('#create', () => {
    it('should call the datasource', async() => {
      // given
      const createdChallenge = 'new challenge';
      vi.spyOn(challengeDatasource, 'create').mockResolvedValue(createdChallenge);

      // when
      const challenge = await create({ id: 'created-challenge-id' });

      // then
      expect(challengeDatasource.create).toHaveBeenCalledWith({ id: 'created-challenge-id' });
      expect(challenge).to.deep.equal(createdChallenge);
    });
  });
});

