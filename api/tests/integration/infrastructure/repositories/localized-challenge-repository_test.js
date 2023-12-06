import { describe, describe as context, expect, it, afterEach } from 'vitest';
import { databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import { localizedChallengeRepository } from '../../../../lib/infrastructure/repositories/index.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';

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
      await localizedChallengeRepository.create([{
        id: 'localizedChallengeId',
        challengeId: 'challengeId',
        locale: 'locale',
      }]);

      // then
      const localizedChallenge = await knex('localized_challenges').select();

      expect(localizedChallenge).to.deep.equal([{
        id: 'localizedChallengeId',
        challengeId: 'challengeId',
        locale: 'locale',
      }]);
    });

    context('when there is no arg', function() {
      it('should do nothing', async function() {
        // when
        await localizedChallengeRepository.create();

        // then
        const localizedChallenge = await knex('localized_challenges').select();

        expect(localizedChallenge).to.deep.equal([]);
      });
    });

    context('when there is no id', function() {
      it('should generate an id and create a localized challenge', async function() {
        // when
        await localizedChallengeRepository.create([{
          challengeId: 'challengeId',
          locale: 'locale',
        }], () => 'generated-id');

        // then
        const localizedChallenge = await knex('localized_challenges').select();

        expect(localizedChallenge).to.deep.equal([{
          id: 'generated-id',
          challengeId: 'challengeId',
          locale: 'locale',
        }]);
      });

      it('should generate multiple unique ids and create localized challenges', async function() {

        // when
        await localizedChallengeRepository.create([
          {
            challengeId: 'challengeId',
            locale: 'en',
          },
          {
            challengeId: 'challengeId',
            locale: 'fr',
          }
        ]);

        // then
        const localizedChallenges = await knex('localized_challenges').select();

        expect(localizedChallenges.length).to.equal(2);
        expect(localizedChallenges[0].id).not.to.equal(localizedChallenges[1].id);
      });

      it('should not create duplicated localizedChallenges when already exist', async () => {
        // given
        await knex('localized_challenges').insert(
          {
            id: 'id',
            challengeId: 'challengeId',
            locale: 'en',
          }
        );

        // when
        await localizedChallengeRepository.create([
          {
            challengeId: 'challengeId',
            locale: 'en',
          },
          {
            challengeId: 'challengeId',
            locale: 'fr',
          }
        ]);

        // then
        const localizedChallenges = await knex('localized_challenges').select().orderBy('locale');

        expect(localizedChallenges.length).to.equal(2);
        expect(localizedChallenges[0]).to.deep.equal({
          id: 'id',
          challengeId: 'challengeId',
          locale: 'en',
        });
      });
    });
  });

  context('#getByChallengeIdAndLocale', () => {
    it('should return localized challenge for challengeId and locale', async () => {
      // given
      const challengeId = 'challengeId';
      const locale = 'nl';
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'localizedChallengeIdFr',
        challengeId,
        locale: 'fr',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'otherLocalizedChallengeIdNl',
        challengeId: 'otherChallengeId',
        locale: 'nl',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'localizedChallengeIdNl',
        challengeId,
        locale,
      });

      await databaseBuilder.commit();

      // when
      const localizedChallenge = await localizedChallengeRepository.getByChallengeIdAndLocale({ challengeId, locale });

      // then
      expect(localizedChallenge).to.deep.equal(domainBuilder.buildLocalizedChallenge({
        id: 'localizedChallengeIdNl',
        challengeId,
        locale,
      }));
    });

    context('when no localized challenge matches the challengeId and locale', () => {
      it('should throw a NotFoundError', async () => {
        // given
        const challengeId = 'challengeId';
        const locale = 'nl';
        databaseBuilder.factory.buildLocalizedChallenge({
          id: 'localizedChallengeIdFr',
          challengeId,
          locale: 'fr',
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: 'otherLocalizedChallengeIdNl',
          challengeId: 'otherChallengeId',
          locale: 'nl',
        });

        await databaseBuilder.commit();

        // when
        const promise = localizedChallengeRepository.getByChallengeIdAndLocale({ challengeId, locale });

        // then
        expect(promise).rejects.to.deep.equal(new NotFoundError('Épreuve ou langue introuvable'));
      });
    });
  });

  context('#listByChallengeId', () => {
    it('should return the list of localized challenge for a challenge ID', async () => {
      const challengeId = 'challengeId';
      // given
      databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeId,
        challengeId,
        locale: 'fr-fr',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeIdEn',
        challengeId,
        locale: 'en',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeIdNl',
        challengeId,
        locale: 'nl',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'otherChallengeId',
        challengeId: 'otherChallengeId',
        locale: 'fr',
      });
      await databaseBuilder.commit();

      // when
      const localizedChallenges = await localizedChallengeRepository.listByChallengeId(challengeId);

      // then
      expect(localizedChallenges).to.deep.equal([
        domainBuilder.buildLocalizedChallenge({
          id: 'challengeIdEn',
          challengeId,
          locale: 'en',
        }),
        domainBuilder.buildLocalizedChallenge({
          id: challengeId,
          challengeId,
          locale: 'fr-fr',
        }),
        domainBuilder.buildLocalizedChallenge({
          id: 'challengeIdNl',
          challengeId,
          locale: 'nl',
        }),
      ]);
    });
  });
});
