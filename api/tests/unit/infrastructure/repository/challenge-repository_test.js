import { describe, expect, it, vi } from 'vitest';
import { create, filter } from '../../../../lib/infrastructure/repositories/challenge-repository.js';
import { challengeDatasource } from '../../../../lib/infrastructure/datasources/airtable/challenge-datasource.js';

describe('Unit | Repository | challenge-repository', () => {

  describe('#filter', () => {
    describe('when ids are specified', () => {
      it('should return challenges with given ids',  async () => {
        // given
        vi.spyOn(challengeDatasource, 'filter').mockResolvedValue([{},{}]);

        // when
        const challenges = await filter({ filter: { ids: ['1', '2'] } });

        // then
        expect(challenges.length).equal(2);
        expect(challengeDatasource.filter).toHaveBeenCalledWith({ filter: { ids: ['1', '2'] } });
      });
    });

    describe('when ids and search are not specified', () => {
      it('should return all challenges',  async () => {
        // given
        vi.spyOn(challengeDatasource, 'filter').mockResolvedValue([{},{}]);
        vi.spyOn(challengeDatasource, 'list').mockResolvedValue([{},{}]);

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
        vi.spyOn(challengeDatasource, 'search').mockResolvedValue([{},{}]);

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

