import { expect } from '../../../test-helper.js';
import { create, filter } from '../../../../lib/infrastructure/repositories/challenge-repository.js';
import { challengeDatasource } from '../../../../lib/infrastructure/datasources/airtable/challenge-datasource.js';
import sinon from 'sinon';

describe('Unit | Repository | challenge-repository', () => {

  describe('#filter', () => {
    describe('when ids are specified', () => {
      it('should return challenges with given ids',  async () => {
        // given
        sinon.stub(challengeDatasource, 'filter').resolves([{},{}]);

        // when
        const challenges = await filter({ filter: { ids: ['1', '2'] } });

        // then
        expect(challenges.length).equal(2);
        expect(challengeDatasource.filter).to.be.calledWith({ filter: { ids: ['1', '2'] } });
      });
    });

    describe('when ids and search are not specified', () => {
      it('should return all challenges',  async () => {
        // given
        sinon.stub(challengeDatasource, 'filter').resolves([{},{}]);
        sinon.stub(challengeDatasource, 'list').resolves([{},{}]);

        // when
        const challenges = await filter({ page: { size: 20 } });

        // then
        expect(challenges.length).equal(2);
        expect(challengeDatasource.filter).to.be.not.called;
        expect(challengeDatasource.list).to.be.calledWith({ page: { size: 20 } });
      });
    });

    describe('when search is specified', () => {
      it('should search challenges according to filters',  async () => {
        // given
        sinon.stub(challengeDatasource, 'filter').resolves([{},{}]);
        sinon.stub(challengeDatasource, 'list').resolves([{},{}]);
        sinon.stub(challengeDatasource, 'search').resolves([{},{}]);

        // when
        const challenges = await filter({ filter: { search: 'toto' } });

        // then
        expect(challenges.length).equal(2);
        expect(challengeDatasource.filter).to.be.not.called;
        expect(challengeDatasource.list).to.be.not.called;
        expect(challengeDatasource.search).to.be.calledWith({ filter: { search: 'toto' } });
      });
    });
  });

  describe('#create', () => {
    it('should call the datasource', async() => {
      // given
      const createdChallenge = 'new challenge';
      sinon.stub(challengeDatasource, 'create').resolves(createdChallenge);

      // when
      const challenge = await create({ id: 'created-challenge-id' });

      // then
      expect(challengeDatasource.create).to.be.calledWith({ id: 'created-challenge-id' });
      expect(challenge).to.deep.equal(createdChallenge);
    });
  });
});

