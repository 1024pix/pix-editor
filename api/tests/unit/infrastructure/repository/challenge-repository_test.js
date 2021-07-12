const { expect } = require('../../../test-helper');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const challengesDataSource = require('../../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const sinon = require('sinon');

describe('Unit | Repository | challenge-repository', () => {

  describe('#filter', () => {
    describe('when ids are specified', () => {
      it('should return challenges with given ids',  async () => {
        // given
        sinon.stub(challengesDataSource, 'filter').resolves([{},{}]);

        // when
        const challenges = await challengeRepository.filter({ ids: ['1', '2'] });

        // then
        expect(challenges.length).equal(2);
        expect(challengesDataSource.filter).to.be.calledWith({ ids: ['1', '2'] });
      });
    });

    describe('when ids are not specified', () => {
      it('should return all challenges',  async () => {
        // given
        sinon.stub(challengesDataSource, 'filter').resolves([{},{}]);
        sinon.stub(challengesDataSource, 'list').resolves([{},{}]);

        // when
        const challenges = await challengeRepository.filter();

        // then
        expect(challenges.length).equal(2);
        expect(challengesDataSource.filter).to.be.not.called;
        expect(challengesDataSource.list).to.be.called;
      });
    });

    describe('when search is specified', () => {
      it('should search challenges according to filters',  async () => {
        // given
        sinon.stub(challengesDataSource, 'filter').resolves([{},{}]);
        sinon.stub(challengesDataSource, 'list').resolves([{},{}]);
        sinon.stub(challengesDataSource, 'search').resolves([{},{}]);

        // when
        const challenges = await challengeRepository.filter({ search: 'toto' });

        // then
        expect(challenges.length).equal(2);
        expect(challengesDataSource.filter).to.be.not.called;
        expect(challengesDataSource.list).to.be.not.called;
        expect(challengesDataSource.search).to.be.calledWith('toto');
      });
    });
  });

  describe('#create', () => {
    it('should call the datasource', async() => {
      // given
      const createdChallenge = 'new challenge';
      sinon.stub(challengesDataSource, 'create').resolves(createdChallenge);

      // when
      const challenge = await challengeRepository.create({ id: 'created-challenge-id' });

      // then
      expect(challengesDataSource.create).to.be.calledWith({ id: 'created-challenge-id' });
      expect(challenge).to.deep.equal(createdChallenge);
    });
  });
});

