const nock = require('nock');
const { expect } = require('../../../test-helper');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const challengesDataSource = require('../../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const sinon = require('sinon');

describe('Unit | Repository | challenge-repository', () => {

  describe('#filter', () => {
    it('should return all challenges',  async () => {
      // given
      sinon.stub(challengesDataSource, 'list').resolves([{},{}]);

      // when
      const challenges = await challengeRepository.filter();

      // then

      expect(challenges.length).equal(2);
    });
  });

});
