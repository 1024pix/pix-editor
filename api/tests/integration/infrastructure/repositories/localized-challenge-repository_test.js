import { describe, describe as context, expect, it, afterEach } from 'vitest';
import { databaseBuilder, knex } from '../../../test-helper.js';
import { localizedChallengeRepository } from '../../../../lib/infrastructure/repositories/index.js';

describe('Integration | Repository | localized-challenge-repository', function() {

  context('#list', function() {
    it('should returns all localized challenges', async function() {
      // given
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeNewid',
        challengeId: 'challengeId',
        locale: 'fr-fr'
      });
      await databaseBuilder.commit();

      // when
      const result = await localizedChallengeRepository.list();

      // then
      expect(result).to.deep.equal([{
        id: 'challengeNewid',
        challengeId: 'challengeId',
        locale: 'fr-fr',
      }]);
    });
  });

  context('#create', function() {
    afterEach(async () => {
      await knex('localized_challenges').truncate();
    });

    it('should create a localized challenge', async function() {
      // when
      await localizedChallengeRepository.create({
        id: 'localizedChallengeId',
        challengeId: 'challengeId',
        locale: 'locale',
      });

      // then
      const localizedChallenge = await knex('localized_challenges').select();

      expect(localizedChallenge).to.deep.equal([{
        id: 'localizedChallengeId',
        challengeId: 'challengeId',
        locale: 'locale',
      }]);
    });
  });
});
