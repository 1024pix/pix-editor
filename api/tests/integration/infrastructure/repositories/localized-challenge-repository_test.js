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
        locale: 'fr-fr',
        embedUrl: 'https://example.com/embed.html',
        status: 'proposé'
      });
      await databaseBuilder.commit();

      // when
      const result = await localizedChallengeRepository.list();

      // then
      expect(result).to.deep.equal([{
        id: 'challengeNewid',
        challengeId: 'challengeId',
        locale: 'fr-fr',
        embedUrl: 'https://example.com/embed.html',
        status: 'proposé',
        fileIds: [],
      }]);
    });
  });

  context('when there is one attachment joined to localized challenges', () => {
    it('should return a list of localized challenges with fileIds', async () => {
      // given
      const id = 'localizedChallengeId';
      const id2 = 'localizedChallengeId2';
      const localizedChallengeBz = databaseBuilder.factory.buildLocalizedChallenge({
        id,
        challengeId: 'challengeId',
        embedUrl: 'mon-url.com',
        locale: 'bz',
      });
      const localizedChallengeNl = databaseBuilder.factory.buildLocalizedChallenge({
        id: id2,
        challengeId: 'challengeId',
        embedUrl: 'mon-url-nl.com',
        locale: 'nl',
      });
      const localizedChallengeFr = databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeId',
        challengeId: 'challengeId',
        embedUrl: 'mon-url-fr.com',
        locale: 'fr',
      });

      const localizedChallengeAttachment = databaseBuilder.factory.buildLocalizedChallengeAttachment({
        localizedChallengeId: localizedChallengeBz.id,
        attachmentId: 'attachment-id-0',
      });
      await databaseBuilder.commit();

      const expectedFrenchChallenge = domainBuilder.buildLocalizedChallenge({
        ...localizedChallengeFr,
        fileIds: [],
      });
      const expectedBzChallenge = domainBuilder.buildLocalizedChallenge({
        ...localizedChallengeBz,
        fileIds: [localizedChallengeAttachment.attachmentId],
      });
      const expectedNlChallenge = domainBuilder.buildLocalizedChallenge({
        ...localizedChallengeNl,
        fileIds: [],
      });

      // when
      const localizedChallenges = await localizedChallengeRepository.list();

      // then
      expect(localizedChallenges).to.deep.equal([expectedFrenchChallenge, expectedBzChallenge, expectedNlChallenge]);
    });
  });

  context('#create', function() {
    afterEach(async () => {
      await knex('localized_challenges').delete();
    });

    it('should create a localized challenge', async function() {
      // when
      await localizedChallengeRepository.create([
        domainBuilder.buildLocalizedChallenge({
          id: 'localizedChallengeId',
          challengeId: 'challengeId',
          locale: 'locale',
          embedUrl: 'https://example.com/embed.html',
        })
      ]);

      // then
      const localizedChallenge = await knex('localized_challenges').select();

      expect(localizedChallenge).to.deep.equal([{
        id: 'localizedChallengeId',
        challengeId: 'challengeId',
        locale: 'locale',
        embedUrl: 'https://example.com/embed.html',
        status: null,
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
          embedUrl: 'https://example.com/embed.html',
        }], () => 'generated-id');

        // then
        const localizedChallenge = await knex('localized_challenges').select();

        expect(localizedChallenge).to.deep.equal([{
          id: 'generated-id',
          challengeId: 'challengeId',
          locale: 'locale',
          embedUrl: 'https://example.com/embed.html',
          status: null,
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
            embedUrl: 'example.com',
          }
        );

        // when
        await localizedChallengeRepository.create([
          {
            challengeId: 'challengeId',
            locale: 'en',
            embedUrl: 'example.com',
          },
          {
            challengeId: 'challengeId',
            locale: 'fr',
            embedUrl: 'example.net',
          }
        ]);

        // then
        const localizedChallenges = await knex('localized_challenges').select().orderBy('locale');

        expect(localizedChallenges.length).to.equal(2);
        expect(localizedChallenges).toEqual([
          {
            id: 'id',
            challengeId: 'challengeId',
            locale: 'en',
            embedUrl: 'example.com',
            status: null,
          },
          {
            id: expect.stringMatching(/^challenge\w+$/),
            challengeId: 'challengeId',
            locale: 'fr',
            embedUrl: 'example.net',
            status: null,
          },
        ]);
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
        embedUrl: null,
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

    context('when there is one attachment joined to localized challenge', () => {
      it('should return localized challenge for challengeId, attachmentIds and locale', async () => {
        // given
        const challengeId = 'challengeId';
        const locale = 'nl';
        const localizedChallengeFr = databaseBuilder.factory.buildLocalizedChallenge({
          id: 'localizedChallengeIdFr',
          challengeId,
          locale: 'fr',
        });
        const localizedChallengeNl = databaseBuilder.factory.buildLocalizedChallenge({
          id: 'localizedChallengeIdNl',
          challengeId,
          locale: 'nl',
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: 'otherLocalizedChallengeIdNl',
          challengeId: 'otherChallengeId',
          locale: 'nl',
        });
        databaseBuilder.factory.buildLocalizedChallengeAttachment({
          localizedChallengeId: localizedChallengeFr.id,
          attachmentId: 'attachment-id-0',
        });
        const localizedChallengeAttachment1 = databaseBuilder.factory.buildLocalizedChallengeAttachment({
          localizedChallengeId: localizedChallengeNl.id,
          attachmentId: 'attachment-id-1',
        });
        const localizedChallengeAttachment2 = databaseBuilder.factory.buildLocalizedChallengeAttachment({
          localizedChallengeId: localizedChallengeNl.id,
          attachmentId: 'attachment-id-2',
        });

        await databaseBuilder.commit();

        // when
        const localizedChallenge = await localizedChallengeRepository.getByChallengeIdAndLocale({ challengeId, locale });

        // then
        expect(localizedChallenge).to.deep.equal(domainBuilder.buildLocalizedChallenge({
          id: 'localizedChallengeIdNl',
          challengeId,
          locale,
          embedUrl: null,
          fileIds: [localizedChallengeAttachment1.attachmentId, localizedChallengeAttachment2.attachmentId]
        }));
      });
    });
  });

  context('#listByChallengeIds', () => {
    it('should return the list of localized challenges for a list of challenge IDs', async () => {
      const challengeId1 = 'challengeId1';
      const challengeId2 = 'challengeId2';
      const embedUrl = 'https://example.com';

      // given
      databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeId1,
        challengeId: challengeId1,
        locale: 'fr-fr',
        embedUrl,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: `${challengeId1}En`,
        challengeId: challengeId1,
        locale: 'en',
        embedUrl,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: `${challengeId1}Nl`,
        challengeId: challengeId1,
        locale: 'nl',
        embedUrl,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeId2,
        challengeId: challengeId2,
        locale: 'fr-fr',
        embedUrl,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: `${challengeId2}En`,
        challengeId: challengeId2,
        locale: 'en',
        embedUrl,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'otherChallengeId',
        challengeId: 'otherChallengeId',
        locale: 'fr',
        embedUrl,
      });
      await databaseBuilder.commit();

      // when
      const localizedChallenges = await localizedChallengeRepository.listByChallengeIds({ challengeIds: [challengeId1, challengeId2] });

      // then
      expect(localizedChallenges).to.deep.equal([
        domainBuilder.buildLocalizedChallenge({
          id: `${challengeId1}En`,
          challengeId: challengeId1,
          locale: 'en',
          embedUrl,
        }),
        domainBuilder.buildLocalizedChallenge({
          id: challengeId1,
          challengeId: challengeId1,
          locale: 'fr-fr',
          embedUrl,
        }),
        domainBuilder.buildLocalizedChallenge({
          id: `${challengeId1}Nl`,
          challengeId: challengeId1,
          locale: 'nl',
          embedUrl,
        }),
        domainBuilder.buildLocalizedChallenge({
          id: `${challengeId2}En`,
          challengeId: challengeId2,
          locale: 'en',
          embedUrl,
        }),
        domainBuilder.buildLocalizedChallenge({
          id: challengeId2,
          challengeId: challengeId2,
          locale: 'fr-fr',
          embedUrl,
        }),
      ]);
    });
  });

  context('#get', () => {
    it('should return localized challenge by id', async () => {
      // given
      const id = 'localizedChallengeId';
      databaseBuilder.factory.buildLocalizedChallenge({
        id,
        challengeId: 'challengeId',
        embedUrl: 'mon-url.com',
        locale: 'bz',
      });
      await databaseBuilder.commit();

      // when
      const localizedChallenge = await localizedChallengeRepository.get({ id });

      // then
      expect(localizedChallenge).to.deep.equal(domainBuilder.buildLocalizedChallenge({
        id,
        challengeId: 'challengeId',
        embedUrl: 'mon-url.com',
        locale: 'bz',
      }));
    });

    context('when there is one attachment joined to localized challenge', () => {
      it('should return localized challenge with fileIds', async () => {
        // given
        const id = 'localizedChallengeId';
        const localizedChallengeBz = databaseBuilder.factory.buildLocalizedChallenge({
          id,
          challengeId: 'challengeId',
          embedUrl: 'mon-url.com',
          locale: 'bz',
        });

        const localizedChallengeAttachment = databaseBuilder.factory.buildLocalizedChallengeAttachment({
          localizedChallengeId: localizedChallengeBz.id,
          attachmentId: 'attachment-id-0',
        });
        await databaseBuilder.commit();

        // when
        const localizedChallenge = await localizedChallengeRepository.get({ id });

        // then
        expect(localizedChallenge).to.deep.equal(domainBuilder.buildLocalizedChallenge({
          id,
          challengeId: 'challengeId',
          embedUrl: 'mon-url.com',
          locale: 'bz',
          fileIds: [localizedChallengeAttachment.attachmentId],
        }));
      });
    });

    context('when id does not exist', () => {
      it('should throw a NotFoundError', async () => {
        // given
        const id = 'unknownLocalizedChallengeId';

        // when
        const promise = localizedChallengeRepository.get({ id });

        // then
        await expect(promise).rejects.to.deep.equal(new NotFoundError('Épreuve ou langue introuvable'));
      });
    });
  });

  context('#getMany', () => {
    it('should return localized challenges by ids', async () => {
      // given
      const ids = ['localizedChallengeId1', 'localizedChallengeId2'];
      databaseBuilder.factory.buildLocalizedChallenge({
        id: ids[0],
        challengeId: 'challengeId1',
        embedUrl: 'mon-url.com',
        locale: 'bz',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: ids[1],
        challengeId: 'challengeId2',
        locale: 'ur',
      });
      await databaseBuilder.commit();

      // when
      const localizedChallenges = await localizedChallengeRepository.getMany({ ids });

      // then
      expect(localizedChallenges).to.deep.equal([
        domainBuilder.buildLocalizedChallenge({
          id: ids[0],
          challengeId: 'challengeId1',
          embedUrl: 'mon-url.com',
          locale: 'bz',
        }),
        domainBuilder.buildLocalizedChallenge({
          id: ids[1],
          challengeId: 'challengeId2',
          embedUrl:  null,
          locale: 'ur',
        }),
      ]);
    });
  });

  context('#update', () => {
    it('should change localized challenge locale and embedUrl', async () => {
      // given
      const id = 'localizedChallengeId';
      databaseBuilder.factory.buildLocalizedChallenge({
        id,
        challengeId: 'challengeId',
        embedUrl: 'my-url.html',
        locale: 'bz',
      });
      await databaseBuilder.commit();

      const localizedChallenge = domainBuilder.buildLocalizedChallenge({
        id,
        challengeId: 'differentChallengeId should not be updated',
        embedUrl: 'my-new-url.html',
        locale: 'ar',
        status: null,
      });

      // when
      const localizedUpdatedChallenge = await localizedChallengeRepository.update({ localizedChallenge });

      // then
      await expect(knex('localized_challenges').select()).resolves.to.deep.equal([
        {
          id,
          challengeId: 'challengeId',
          embedUrl: 'my-new-url.html',
          locale: 'ar',
          status: null,
        },
      ]);

      expect(localizedUpdatedChallenge).to.deep.equal(
        domainBuilder.buildLocalizedChallenge({
          id,
          challengeId: 'challengeId',
          embedUrl: 'my-new-url.html',
          locale: 'ar',
          status: null,
        }));
    });
  });
});
