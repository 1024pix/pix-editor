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
  });
});

