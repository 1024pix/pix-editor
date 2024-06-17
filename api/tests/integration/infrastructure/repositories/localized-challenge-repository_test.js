import { afterEach, describe as context, describe, expect, it } from 'vitest';
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
        status: 'proposé',
        geography: null,
        urlsToConsult: ['pouet.com', 'truc.fr'],
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
        geography: null,
        urlsToConsult: ['pouet.com', 'truc.fr'],
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
      await localizedChallengeRepository.create({ localizedChallenges: [
        domainBuilder.buildLocalizedChallenge({
          id: 'localizedChallengeId',
          challengeId: 'challengeId',
          locale: 'locale',
          embedUrl: 'https://example.com/embed.html',
          geography: 'AZ',
          urlsToConsult: ['lien1', 'lien2'],
        })
      ] });

      // then
      const localizedChallenge = await knex('localized_challenges').select();

      expect(localizedChallenge).to.deep.equal([{
        id: 'localizedChallengeId',
        challengeId: 'challengeId',
        locale: 'locale',
        embedUrl: 'https://example.com/embed.html',
        status: null,
        geography: 'AZ',
        urlsToConsult: ['lien1', 'lien2'],
      }]);
    });

    context('when there is no arg', function() {
      it('should do nothing', async function() {
        // when
        await localizedChallengeRepository.create({});

        // then
        const localizedChallenge = await knex('localized_challenges').select();

        expect(localizedChallenge).to.deep.equal([]);
      });
    });

    context('when there is no id', function() {
      it('should generate an id and create a localized challenge', async function() {
        // when
        await localizedChallengeRepository.create({ localizedChallenges:[{
          challengeId: 'challengeId',
          locale: 'locale',
          embedUrl: 'https://example.com/embed.html',
          geography: 'BE',
          urlsToConsult: ['lien1', 'lien2'],
        }], generateId: () => 'generated-id' });

        // then
        const localizedChallenge = await knex('localized_challenges').select();

        expect(localizedChallenge).to.deep.equal([{
          id: 'generated-id',
          challengeId: 'challengeId',
          locale: 'locale',
          embedUrl: 'https://example.com/embed.html',
          status: null,
          geography: 'BE',
          urlsToConsult: ['lien1', 'lien2'],
        }]);
      });

      it('should generate multiple unique ids and create localized challenges', async function() {

        // when
        await localizedChallengeRepository.create({ localizedChallenges: [
          {
            challengeId: 'challengeId',
            locale: 'en',
          },
          {
            challengeId: 'challengeId',
            locale: 'fr',
          }
        ] });

        // then
        const localizedChallenges = await knex('localized_challenges').select();

        expect(localizedChallenges.length).to.equal(2);
        expect(localizedChallenges[0].id).not.to.equal(localizedChallenges[1].id);
      });

      it('should not create duplicated localizedChallenges when already exist', async () => {
        // given
        databaseBuilder.factory.buildLocalizedChallenge({
          id: 'id',
          challengeId: 'challengeId',
          locale: 'en',
          embedUrl: 'example.com',
          urlsToConsult: ['link1', 'link2'],
        });
        await databaseBuilder.commit();

        // when
        await localizedChallengeRepository.create({ localizedChallenges: [
          {
            challengeId: 'challengeId',
            locale: 'en',
            embedUrl: 'example.com',
            geography: null,
            urlsToConsult: ['link1', 'link2'],
          },
          {
            challengeId: 'challengeId',
            locale: 'fr',
            embedUrl: 'example.net',
            geography: 'FR',
            urlsToConsult: ['lien1', 'lien2'],
          }
        ] });

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
            geography: null,
            urlsToConsult: ['link1', 'link2'],
          },
          {
            id: expect.stringMatching(/^challenge\w+$/),
            challengeId: 'challengeId',
            locale: 'fr',
            embedUrl: 'example.net',
            status: null,
            geography: 'FR',
            urlsToConsult: ['lien1', 'lien2'],
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
        urlsToConsult: ['lien1', 'lien2'],
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'otherLocalizedChallengeIdNl',
        challengeId: 'otherChallengeId',
        locale: 'nl',
        urlsToConsult: ['linkNl10', 'linkNl20'],
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'localizedChallengeIdNl',
        challengeId,
        locale,
        urlsToConsult: ['linkNl1', 'linkNl2'],
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
        urlsToConsult: ['linkNl1', 'linkNl2'],
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
          fileIds: [localizedChallengeAttachment1.attachmentId, localizedChallengeAttachment2.attachmentId],
          urlsToConsult: null
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
          urlsToConsult: null,
        }),
        domainBuilder.buildLocalizedChallenge({
          id: challengeId1,
          challengeId: challengeId1,
          locale: 'fr-fr',
          embedUrl,
          urlsToConsult: null,
        }),
        domainBuilder.buildLocalizedChallenge({
          id: `${challengeId1}Nl`,
          challengeId: challengeId1,
          locale: 'nl',
          embedUrl,
          urlsToConsult: null,
        }),
        domainBuilder.buildLocalizedChallenge({
          id: `${challengeId2}En`,
          challengeId: challengeId2,
          locale: 'en',
          embedUrl,
          urlsToConsult: null,
        }),
        domainBuilder.buildLocalizedChallenge({
          id: challengeId2,
          challengeId: challengeId2,
          locale: 'fr-fr',
          embedUrl,
          urlsToConsult: null,
        }),
      ]);
    });
    context('when there are attachments', () => {
      it('should return the list of localized challenges with attachment for a list of challenge IDs', async () => {
        const challengeId1 = 'challengeId1';
        const challengeId2 = 'challengeId2';
        const embedUrl = 'url.com';

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
          id: `${challengeId2}Nl`,
          challengeId: challengeId2,
          locale: 'nl',
          embedUrl,
        });

        databaseBuilder.factory.buildLocalizedChallengeAttachment({
          localizedChallengeId: `${challengeId2}Nl`,
          attachmentId: 'attachment-nl',
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
            urlsToConsult: null,
          }),
          domainBuilder.buildLocalizedChallenge({
            id: challengeId1,
            challengeId: challengeId1,
            locale: 'fr-fr',
            embedUrl,
            urlsToConsult: null,
          }),
          domainBuilder.buildLocalizedChallenge({
            id: `${challengeId2}Nl`,
            challengeId: challengeId2,
            locale: 'nl',
            fileIds: ['attachment-nl'],
            embedUrl,
            urlsToConsult: null,
          })
        ]);
      });
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
        urlsToConsult: null,
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
          urlsToConsult: null,
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

  context('#getMany', () =>   {
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
          urlsToConsult: null,
        }),
        domainBuilder.buildLocalizedChallenge({
          id: ids[1],
          challengeId: 'challengeId2',
          embedUrl:  null,
          locale: 'ur',
          urlsToConsult: null,
        }),
      ]);
    });
    context('when there is one attachment joined to localized challenge', ()=> {
      it('should return localized challenges by ids with attachment', async () => {
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
        databaseBuilder.factory.buildLocalizedChallengeAttachment({
          localizedChallengeId: ids[0],
          attachmentId: 'attachmentId',
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
            fileIds: ['attachmentId'],
            urlsToConsult: null,
          }),
          domainBuilder.buildLocalizedChallenge({
            id: ids[1],
            challengeId: 'challengeId2',
            embedUrl:  null,
            locale: 'ur',
            urlsToConsult: null,
          }),
        ]);
      });

    });
  });

  context('#update', () => {
    it('should change localized challenge locale, embedUrl, geography and urlsToConsult', async () => {
      // given
      const id = 'localizedChallengeId';
      databaseBuilder.factory.buildLocalizedChallenge({
        id,
        challengeId: 'challengeId',
        embedUrl: 'my-url.html',
        locale: 'bz',
        geography: 'BZ',
      });
      await databaseBuilder.commit();

      const localizedChallenge = domainBuilder.buildLocalizedChallenge({
        id,
        challengeId: 'differentChallengeId should not be updated',
        embedUrl: 'my-new-url.html',
        locale: 'ar',
        status: null,
        geography: 'AR',
        urlsToConsult: ['my-new-link']
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
          geography: 'AR',
          urlsToConsult: ['my-new-link']
        },
      ]);

      expect(localizedUpdatedChallenge).to.deep.equal(
        domainBuilder.buildLocalizedChallenge({
          id,
          challengeId: 'challengeId',
          embedUrl: 'my-new-url.html',
          locale: 'ar',
          status: null,
          geography: 'AR',
          urlsToConsult: ['my-new-link']
        }));
    });

    context('when there is one attachment joined to localized challenge', ()=> {
      it('should change localized challenge locale and embedUrl with attachmentId', async () => {
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
          files: ['attachmentId'],
          urlsToConsult: null,
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
            geography: null,
            urlsToConsult: null,
          },
        ]);

        expect(localizedUpdatedChallenge).to.deep.equal(
          domainBuilder.buildLocalizedChallenge({
            id,
            challengeId: 'challengeId',
            embedUrl: 'my-new-url.html',
            locale: 'ar',
            status: null,
            files: ['attachmentId'],
            urlsToConsult: null,
          }));
      });
    });
  });

  context('#updateBatch', () => {
    it('should update localized challenges locale, embedUrl, geography and urlsToConsult', async () => {
      // given
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'idA',
        challengeId: 'idA',
        locale: 'fr',
        embedUrl: 'embedUrlBeforeA',
        geography: 'AA',
        status: 'statusBeforeA',
        urlsToConsult: ['urlToConsultBeforeA'],
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'idB',
        challengeId: 'idA',
        locale: 'en',
        embedUrl: 'embedUrlBeforeB',
        geography: 'BB',
        status: 'statusBeforeB',
        urlsToConsult: ['urlToConsultBeforeB1', 'urlToConsultBeforeB2'],
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'idUntouched',
        challengeId: 'idB',
        locale: 'en',
        embedUrl: 'embedUrlUntouched',
        geography: 'UU',
        status: 'statusUntouched',
        urlsToConsult: ['urlToConsultUntouched'],
      });
      await databaseBuilder.commit();

      const localizedChallengeA = domainBuilder.buildLocalizedChallenge({
        id: 'idA',
        challengeId: 'idA',
        locale: 'fr',
        embedUrl: 'embedUrlAfterA',
        geography: 'ZZ',
        status: 'statusAfterA',
        urlsToConsult: [],
        fileIds: ['dontForgetMeA'],
      });
      const localizedChallengeB = domainBuilder.buildLocalizedChallenge({
        id: 'idB',
        challengeId: 'idA',
        locale: 'en',
        embedUrl: 'embedUrlAfterB',
        geography: 'YY',
        status: null,
        urlsToConsult: ['urlToConsultAfterB'],
        fileIds: ['dontForgetMeB'],
      });

      // when
      const localizedUpdatedChallenges = await localizedChallengeRepository.updateBatch({ localizedChallenges: [localizedChallengeA, localizedChallengeB] });

      // then
      await expect(knex('localized_challenges').select().orderBy('id')).resolves.to.deep.equal([
        {
          id: 'idA',
          challengeId: 'idA',
          locale: 'fr',
          embedUrl: 'embedUrlAfterA',
          geography: 'ZZ',
          status: 'statusAfterA',
          urlsToConsult: [],
        },
        {
          id: 'idB',
          challengeId: 'idA',
          locale: 'en',
          embedUrl: 'embedUrlAfterB',
          geography: 'YY',
          status: null,
          urlsToConsult: ['urlToConsultAfterB'],
        },
        {
          id: 'idUntouched',
          challengeId: 'idB',
          locale: 'en',
          embedUrl: 'embedUrlUntouched',
          geography: 'UU',
          status: 'statusUntouched',
          urlsToConsult: ['urlToConsultUntouched'],
        },
      ]);

      expect(localizedUpdatedChallenges).toStrictEqual([
        domainBuilder.buildLocalizedChallenge({
          id: 'idA',
          challengeId: 'idA',
          locale: 'fr',
          embedUrl: 'embedUrlAfterA',
          geography: 'ZZ',
          status: 'statusAfterA',
          urlsToConsult: [],
          fileIds: ['dontForgetMeA'],
        }),
        domainBuilder.buildLocalizedChallenge({
          id: 'idB',
          challengeId: 'idA',
          locale: 'en',
          embedUrl: 'embedUrlAfterB',
          geography: 'YY',
          status: null,
          urlsToConsult: ['urlToConsultAfterB'],
          fileIds: ['dontForgetMeB'],
        }),
      ]);
    });
  });
});
