import { beforeEach, describe as context, describe, expect, it } from 'vitest';
import { databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import { localizedChallengeRepository } from '../../../../lib/infrastructure/repositories/index.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';
import { LocalizedChallenge } from '../../../../lib/domain/models/index.js';

describe('Integration | Repository | localized-challenge-repository', function() {
  const challengeId = 'challengeId';
  const otherChallengeId = 'otherChallengeId';

  beforeEach(async () => {
    databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
    databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
    databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
    databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
    databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
    databaseBuilder.factory.buildSkill({ id: 'skill1', tubeId: 'tube1' });
    databaseBuilder.factory.buildChallenge(
      domainBuilder.buildChallengeDatasourceObject({ id: challengeId, skillId: 'skill1', version: 1 }),
    );
    databaseBuilder.factory.buildChallenge(
      domainBuilder.buildChallengeDatasourceObject({ id: otherChallengeId, skillId: 'skill1', version: 2 }),
    );
    await databaseBuilder.commit();
  });

  context('#list', function() {
    it('should return all localized challenges ordered by challenge id and locale', async function() {
      // given
      databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeId,
        challengeId,
        locale: 'fr',
        embedUrl: 'https://example.com/embed.html',
        status: 'proposé',
        geography: 'AA',
        urlsToConsult: ['pouet.com', 'truc.fr'],
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: true,
        toRephrase: true,
      });

      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeNewid',
        challengeId,
        locale: 'fr-fr',
        embedUrl: 'https://example.com/embed.html',
        status: LocalizedChallenge.STATUSES.PAUSE,
        geography: 'AA',
        urlsToConsult: ['pouet.com', 'truc.fr'],
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
        isAwarenessChallenge: false,
        toRephrase: false,
        validatedAt: new Date('2021-01-01T18:00:00Z'),
      });
      await databaseBuilder.commit();

      // when
      const result = await localizedChallengeRepository.list();

      // then
      expect(result).toStrictEqual([
        domainBuilder.buildLocalizedChallenge({
          id: 'challengeId',
          challengeId: 'challengeId',
          locale: 'fr',
          embedUrl: 'https://example.com/embed.html',
          status: 'proposé',
          fileIds: [],
          geography: 'AA',
          urlsToConsult: ['pouet.com', 'truc.fr'],
          requireGafamWebsiteAccess: true,
          isIncompatibleIpadCertif: true,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
          isAwarenessChallenge: true,
          toRephrase: true,
          validatedAt: null,
        }),
        domainBuilder.buildLocalizedChallenge({
          id: 'challengeNewid',
          challengeId: 'challengeId',
          locale: 'fr-fr',
          embedUrl: 'https://example.com/embed.html',
          status: LocalizedChallenge.STATUSES.PAUSE,
          fileIds: [],
          geography: 'AA',
          urlsToConsult: ['pouet.com', 'truc.fr'],
          requireGafamWebsiteAccess: false,
          isIncompatibleIpadCertif: false,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
          isAwarenessChallenge: false,
          toRephrase: false,
          validatedAt: new Date('2021-01-01T18:00:00Z'),
        }),
      ]);
    });

    context('when there is one attachment joined to localized challenges', () => {
      it('should return a list of localized challenges with fileIds', async () => {
        // given
        const id = 'localizedChallengeId';
        const id2 = 'localizedChallengeId2';
        const localizedChallengeBz = databaseBuilder.factory.buildLocalizedChallenge({
          id,
          challengeId,
          embedUrl: 'mon-url.com',
          locale: 'bz',
        });
        const localizedChallengeNl = databaseBuilder.factory.buildLocalizedChallenge({
          id: id2,
          challengeId,
          embedUrl: 'mon-url-nl.com',
          locale: 'nl',
        });
        const localizedChallengeFr = databaseBuilder.factory.buildLocalizedChallenge({
          id: challengeId,
          challengeId,
          embedUrl: 'mon-url-fr.com',
          locale: 'fr',
        });

        databaseBuilder.factory.buildAttachment(
          domainBuilder.buildAttachmentDatasourceObject({
            id: 'attachment-id-0',
            challengeId,
            localizedChallengeId: localizedChallengeBz.id,
          }),
        );
        await databaseBuilder.commit();

        const expectedFrenchChallenge = domainBuilder.buildLocalizedChallenge({
          ...localizedChallengeFr,
          fileIds: [],
        });
        const expectedBzChallenge = domainBuilder.buildLocalizedChallenge({
          ...localizedChallengeBz,
          fileIds: ['attachment-id-0'],
        });
        const expectedNlChallenge = domainBuilder.buildLocalizedChallenge({
          ...localizedChallengeNl,
          fileIds: [],
        });

        // when
        const localizedChallenges = await localizedChallengeRepository.list();

        // then
        expect(localizedChallenges).toStrictEqual([
          expectedBzChallenge,
          expectedFrenchChallenge,
          expectedNlChallenge,
        ]);
      });
    });
  });

  context('#create', function() {
    it('should create a localized challenge', async function() {
      // when
      await localizedChallengeRepository.create({
        localizedChallenges: [
          domainBuilder.buildLocalizedChallenge({
            id: 'localizedChallengeId',
            challengeId: 'challengeId',
            locale: 'locale',
            embedUrl: 'https://example.com/embed.html',
            geography: 'AZ',
            urlsToConsult: ['lien1', 'lien2'],
            status: LocalizedChallenge.STATUSES.PRIMARY,
            requireGafamWebsiteAccess: true,
            isIncompatibleIpadCertif: true,
            deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
            isAwarenessChallenge: true,
            toRephrase: true,
            hasEmbedInternalValidation: true,
            noValidationNeeded: true,
            validatedAt: null,
          }),
        ],
      });

      // then
      const localizedChallenge = await knex('localized_challenges').select();

      expect(localizedChallenge).to.deep.equal([
        {
          id: 'localizedChallengeId',
          challengeId,
          locale: 'locale',
          embedUrl: 'https://example.com/embed.html',
          status: LocalizedChallenge.STATUSES.PRIMARY,
          geography: 'AZ',
          urlsToConsult: ['lien1', 'lien2'],
          requireGafamWebsiteAccess: true,
          isIncompatibleIpadCertif: true,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
          isAwarenessChallenge: true,
          toRephrase: true,
          hasEmbedInternalValidation: true,
          noValidationNeeded: true,
          validatedAt: null,
        },
      ]);
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
        const localizedChallengeToCreate = domainBuilder.buildLocalizedChallenge({
          challengeId,
          locale: 'locale',
          embedUrl: 'https://example.com/embed.html',
          geography: 'BE',
          urlsToConsult: ['lien1', 'lien2'],
          status: LocalizedChallenge.STATUSES.PRIMARY,
          requireGafamWebsiteAccess: true,
          isIncompatibleIpadCertif: true,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
          isAwarenessChallenge: true,
          toRephrase: true,
          hasEmbedInternalValidation: true,
          noValidationNeeded: true,
          validatedAt: null,
        });
        delete localizedChallengeToCreate.id;
        await localizedChallengeRepository.create({
          localizedChallenges: [localizedChallengeToCreate],
          generateId: () => 'generated-id',
        });

        // then
        const localizedChallenge = await knex('localized_challenges').select();

        expect(localizedChallenge).to.deep.equal([
          {
            id: 'generated-id',
            challengeId: 'challengeId',
            locale: 'locale',
            embedUrl: 'https://example.com/embed.html',
            status: LocalizedChallenge.STATUSES.PRIMARY,
            geography: 'BE',
            urlsToConsult: ['lien1', 'lien2'],
            requireGafamWebsiteAccess: true,
            isIncompatibleIpadCertif: true,
            deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
            isAwarenessChallenge: true,
            toRephrase: true,
            hasEmbedInternalValidation: true,
            noValidationNeeded: true,
            validatedAt: null,
          },
        ]);
      });

      it('should generate multiple unique ids and create localized challenges', async function() {
        // when
        await localizedChallengeRepository.create({
          localizedChallenges: [
            {
              challengeId,
              locale: 'en',
            },
            {
              challengeId,
              locale: 'fr',
            },
          ],
        });

        // then
        const localizedChallenges = await knex('localized_challenges').select();

        expect(localizedChallenges.length).to.equal(2);
        expect(localizedChallenges[0].id).not.to.equal(localizedChallenges[1].id);
      });

      it('should not create duplicated localizedChallenges when already exist', async () => {
        // given
        databaseBuilder.factory.buildLocalizedChallenge({
          id: 'id',
          challengeId,
          locale: 'en',
          embedUrl: 'example.com',
          urlsToConsult: ['link1', 'link2'],
          requireGafamWebsiteAccess: true,
          isIncompatibleIpadCertif: true,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
          isAwarenessChallenge: true,
          toRephrase: true,
          hasEmbedInternalValidation: true,
          noValidationNeeded: true,
          validatedAt: null,
        });
        await databaseBuilder.commit();

        // when
        await localizedChallengeRepository.create({
          localizedChallenges: [
            {
              challengeId: 'challengeId',
              locale: 'en',
              embedUrl: 'example.com',
              geography: 'AA',
              urlsToConsult: ['link1', 'link2'],
              status: LocalizedChallenge.STATUSES.PRIMARY,
              requireGafamWebsiteAccess: false,
              isIncompatibleIpadCertif: false,
              deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
              isAwarenessChallenge: false,
              toRephrase: false,
              hasEmbedInternalValidation: false,
              noValidationNeeded: true,
              validatedAt: null,
            },
            {
              challengeId: 'challengeId',
              locale: 'fr',
              embedUrl: 'example.net',
              geography: 'FR',
              urlsToConsult: ['lien1', 'lien2'],
              status: LocalizedChallenge.STATUSES.PRIMARY,
              requireGafamWebsiteAccess: true,
              isIncompatibleIpadCertif: false,
              deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.RAS,
              isAwarenessChallenge: true,
              toRephrase: false,
              hasEmbedInternalValidation: true,
              noValidationNeeded: false,
              validatedAt: null,
            },
          ],
        });

        // then
        const localizedChallenges = await knex('localized_challenges').select().orderBy('locale');

        expect(localizedChallenges.length).to.equal(2);
        expect(localizedChallenges).toStrictEqual([
          {
            id: 'id',
            challengeId: 'challengeId',
            locale: 'en',
            embedUrl: 'example.com',
            status: LocalizedChallenge.STATUSES.PRIMARY,
            geography: 'AA',
            urlsToConsult: ['link1', 'link2'],
            requireGafamWebsiteAccess: true,
            isIncompatibleIpadCertif: true,
            deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
            isAwarenessChallenge: true,
            toRephrase: true,
            hasEmbedInternalValidation: true,
            noValidationNeeded: true,
            validatedAt: null,
          },
          {
            id: expect.stringMatching(/^challenge\w+$/),
            challengeId: 'challengeId',
            locale: 'fr',
            embedUrl: 'example.net',
            status: LocalizedChallenge.STATUSES.PRIMARY,
            geography: 'FR',
            urlsToConsult: ['lien1', 'lien2'],
            requireGafamWebsiteAccess: true,
            isIncompatibleIpadCertif: false,
            deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.RAS,
            isAwarenessChallenge: true,
            toRephrase: false,
            hasEmbedInternalValidation: true,
            noValidationNeeded: false,
            validatedAt: null,
          },
        ]);
      });
    });
  });

  context('#getByChallengeIdAndLocale', () => {
    it('should return localized challenge for challengeId and locale', async () => {
      // given
      const locale = 'nl';
      databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeId,
        challengeId,
        locale: 'fr',
        urlsToConsult: ['lien1', 'lien2'],
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: otherChallengeId,
        challengeId: otherChallengeId,
        locale: 'fr',
        urlsToConsult: ['lien10', 'lien20'],
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'otherLocalizedChallengeIdNl',
        challengeId: otherChallengeId,
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
      expect(localizedChallenge).toStrictEqual(
        domainBuilder.buildLocalizedChallenge({
          id: 'localizedChallengeIdNl',
          challengeId,
          locale,
          embedUrl: null,
          urlsToConsult: ['linkNl1', 'linkNl2'],
        }),
      );
    });

    context('when no localized challenge matches the challengeId and locale', () => {
      it('should throw a NotFoundError', async () => {
        // given
        const locale = 'nl';
        databaseBuilder.factory.buildLocalizedChallenge({
          id: challengeId,
          challengeId,
          locale: 'fr',
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: 'otherLocalizedChallengeIdNl',
          challengeId: otherChallengeId,
          locale: 'nl',
        });

        await databaseBuilder.commit();

        // when
        const promise = localizedChallengeRepository.getByChallengeIdAndLocale({ challengeId, locale });

        // then
        await expect(promise).rejects.toStrictEqual(new NotFoundError('Épreuve ou langue introuvable'));
      });
    });

    context('when there is one attachment joined to localized challenge', () => {
      it('should return localized challenge for challengeId, attachmentIds and locale', async () => {
        // given
        const locale = 'nl';
        databaseBuilder.factory.buildLocalizedChallenge({
          id: challengeId,
          challengeId,
          locale: 'fr',
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: otherChallengeId,
          challengeId: otherChallengeId,
          locale: 'fr',
        });
        const localizedChallengeNl = databaseBuilder.factory.buildLocalizedChallenge({
          id: 'localizedChallengeIdNl',
          challengeId,
          locale: 'nl',
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: 'otherLocalizedChallengeIdNl',
          challengeId: otherChallengeId,
          locale: 'nl',
        });
        databaseBuilder.factory.buildAttachment(
          domainBuilder.buildAttachmentDatasourceObject({
            id: 'attachment-id-1',
            challengeId,
            localizedChallengeId: localizedChallengeNl.id,
          }),
        );
        databaseBuilder.factory.buildAttachment(
          domainBuilder.buildAttachmentDatasourceObject({
            id: 'attachment-id-2',
            challengeId,
            localizedChallengeId: localizedChallengeNl.id,
          }),
        );

        await databaseBuilder.commit();

        // when
        const localizedChallenge = await localizedChallengeRepository.getByChallengeIdAndLocale({
          challengeId,
          locale,
        });

        // then
        expect(localizedChallenge).toStrictEqual(
          domainBuilder.buildLocalizedChallenge({
            id: 'localizedChallengeIdNl',
            challengeId,
            locale,
            embedUrl: null,
            fileIds: ['attachment-id-1', 'attachment-id-2'],
            urlsToConsult: null,
          }),
        );
      });
    });
  });

  context('#listByChallengeIds', () => {
    it('should return the list of localized challenges for a list of challenge IDs', async () => {
      const embedUrl = 'https://example.com';

      // given
      databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeId,
        challengeId,
        locale: 'fr-fr',
        embedUrl,
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: true,
        toRephrase: true,
        hasEmbedInternalValidation: true,
        noValidationNeeded: true,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: `${challengeId}En`,
        challengeId,
        locale: 'en',
        embedUrl,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: `${challengeId}Nl`,
        challengeId,
        locale: 'nl',
        embedUrl,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: otherChallengeId,
        challengeId: otherChallengeId,
        locale: 'fr-fr',
        embedUrl,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: `${otherChallengeId}En`,
        challengeId: otherChallengeId,
        locale: 'en',
        embedUrl,
      });
      databaseBuilder.factory.buildChallenge(
        domainBuilder.buildChallengeDatasourceObject({
          id: 'unlistedChallengeId',
          skillId: 'skill1',
          version: 3,
        }),
      );
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'unlistedChallengeId',
        challengeId: 'unlistedChallengeId',
        locale: 'fr',
        embedUrl,
      });
      await databaseBuilder.commit();

      // when
      const localizedChallenges = await localizedChallengeRepository.listByChallengeIds({ challengeIds: [challengeId, otherChallengeId] });

      // then
      expect(localizedChallenges).toStrictEqual([
        domainBuilder.buildLocalizedChallenge({
          id: `${challengeId}En`,
          challengeId: challengeId,
          locale: 'en',
          embedUrl,
          urlsToConsult: null,
        }),
        domainBuilder.buildLocalizedChallenge({
          id: challengeId,
          challengeId: challengeId,
          locale: 'fr-fr',
          embedUrl,
          urlsToConsult: null,
          requireGafamWebsiteAccess: true,
          isIncompatibleIpadCertif: true,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
          isAwarenessChallenge: true,
          toRephrase: true,
          hasEmbedInternalValidation: true,
          noValidationNeeded: true,
        }),
        domainBuilder.buildLocalizedChallenge({
          id: `${challengeId}Nl`,
          challengeId: challengeId,
          locale: 'nl',
          embedUrl,
          urlsToConsult: null,
        }),
        domainBuilder.buildLocalizedChallenge({
          id: `${otherChallengeId}En`,
          challengeId: otherChallengeId,
          locale: 'en',
          embedUrl,
          urlsToConsult: null,
        }),
        domainBuilder.buildLocalizedChallenge({
          id: otherChallengeId,
          challengeId: otherChallengeId,
          locale: 'fr-fr',
          embedUrl,
          urlsToConsult: null,
        }),
      ]);
    });

    context('when there are attachments', () => {
      it('should return the list of localized challenges with attachment for a list of challenge IDs', async () => {
        const embedUrl = 'url.com';

        // given
        databaseBuilder.factory.buildLocalizedChallenge({
          id: challengeId,
          challengeId,
          locale: 'fr-fr',
          embedUrl,
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: `${challengeId}En`,
          challengeId,
          locale: 'en',
          embedUrl,
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: otherChallengeId,
          challengeId: otherChallengeId,
          locale: 'fr-fr',
          embedUrl,
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: `${otherChallengeId}Nl`,
          challengeId: otherChallengeId,
          locale: 'nl',
          embedUrl,
        });

        databaseBuilder.factory.buildAttachment(
          domainBuilder.buildAttachmentDatasourceObject({
            challengeId: otherChallengeId,
            localizedChallengeId: `${otherChallengeId}Nl`,
            id: 'attachment-nl',
          }),
        );

        await databaseBuilder.commit();

        // when
        const localizedChallenges = await localizedChallengeRepository.listByChallengeIds({ challengeIds: [challengeId, otherChallengeId] });

        // then
        expect(localizedChallenges).toStrictEqual([
          domainBuilder.buildLocalizedChallenge({
            id: `${challengeId}En`,
            challengeId: challengeId,
            locale: 'en',
            embedUrl,
            urlsToConsult: null,
          }),
          domainBuilder.buildLocalizedChallenge({
            id: challengeId,
            challengeId: challengeId,
            locale: 'fr-fr',
            embedUrl,
            urlsToConsult: null,
          }),
          domainBuilder.buildLocalizedChallenge({
            id: otherChallengeId,
            challengeId: otherChallengeId,
            locale: 'fr-fr',
            embedUrl,
            urlsToConsult: null,
          }),
          domainBuilder.buildLocalizedChallenge({
            id: `${otherChallengeId}Nl`,
            challengeId: otherChallengeId,
            locale: 'nl',
            fileIds: ['attachment-nl'],
            embedUrl,
            urlsToConsult: null,
          }),
        ]);
      });
    });
  });

  context('#getMany', () => {
    it('should return the list of localized challenges for a list of challenge IDs', async () => {
      const id1 = 'locChallengeId1';
      const id2 = 'locChallengeId2';
      const id3 = 'locChallengeId3';
      const embedUrl = 'https://example.com';

      // given
      databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeId,
        challengeId,
        locale: 'fr',
        embedUrl,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: id1,
        challengeId,
        locale: 'fr-fr',
        embedUrl,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: id2,
        challengeId,
        locale: 'en',
        embedUrl,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: otherChallengeId,
        challengeId: otherChallengeId,
        locale: 'fr',
        embedUrl,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: id3,
        challengeId: otherChallengeId,
        locale: 'nl',
        embedUrl,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'anotherOne',
        challengeId: otherChallengeId,
        locale: 'fr-fr',
        embedUrl,
      });
      await databaseBuilder.commit();

      // when
      const localizedChallenges = await localizedChallengeRepository.getMany({
        ids: [
          id1,
          id2,
          id3,
        ],
      });

      // then
      expect(localizedChallenges).toStrictEqual([
        domainBuilder.buildLocalizedChallenge({
          id: id2,
          challengeId: challengeId,
          locale: 'en',
          embedUrl,
          urlsToConsult: null,
        }),
        domainBuilder.buildLocalizedChallenge({
          id: id1,
          challengeId: challengeId,
          locale: 'fr-fr',
          embedUrl,
          urlsToConsult: null,
        }),
        domainBuilder.buildLocalizedChallenge({
          id: id3,
          challengeId: otherChallengeId,
          locale: 'nl',
          embedUrl,
          urlsToConsult: null,
        }),
      ]);
    });

    context('when there are attachments', () => {
      it('should return the list of localized challenges with attachment for a list of challenge IDs', async () => {
        const id1 = 'locChallengeId1';
        const id2 = 'locChallengeId2';
        const id3 = 'locChallengeId3';
        const embedUrl = 'url.com';

        // given
        databaseBuilder.factory.buildLocalizedChallenge({
          id: challengeId,
          challengeId,
          locale: 'fr',
          embedUrl,
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: id1,
          challengeId,
          locale: 'fr-fr',
          embedUrl,
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: id2,
          challengeId,
          locale: 'en',
          embedUrl,
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: otherChallengeId,
          challengeId: otherChallengeId,
          locale: 'fr',
          embedUrl,
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: id3,
          challengeId: otherChallengeId,
          locale: 'nl',
          embedUrl,
        });

        const attachment = domainBuilder.buildAttachmentDatasourceObject({
          id: 'attachment-en',
          challengeId,
          localizedChallengeId: id2,
        });
        databaseBuilder.factory.buildAttachment(attachment);

        await databaseBuilder.commit();

        // when
        const localizedChallenges = await localizedChallengeRepository.getMany({
          ids: [
            id1,
            id2,
            id3,
          ],
        });

        // then
        expect(localizedChallenges).toStrictEqual([
          domainBuilder.buildLocalizedChallenge({
            id: id2,
            challengeId: challengeId,
            locale: 'en',
            embedUrl,
            urlsToConsult: null,
            fileIds: ['attachment-en'],
          }),
          domainBuilder.buildLocalizedChallenge({
            id: id1,
            challengeId: challengeId,
            locale: 'fr-fr',
            embedUrl,
            urlsToConsult: null,
          }),
          domainBuilder.buildLocalizedChallenge({
            id: id3,
            challengeId: otherChallengeId,
            locale: 'nl',
            embedUrl,
            urlsToConsult: null,
          }),
        ]);
      });
    });
  });

  context('#get', () => {
    it('should return localized challenge by id', async () => {
      // given
      const id = 'localizedChallengeId';
      databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeId,
        challengeId,
        locale: 'fr',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id,
        challengeId,
        embedUrl: 'mon-url.com',
        locale: 'bz',
      });
      await databaseBuilder.commit();

      // when
      const localizedChallenge = await localizedChallengeRepository.get({ id });

      // then
      expect(localizedChallenge).toStrictEqual(
        domainBuilder.buildLocalizedChallenge({
          id,
          challengeId: 'challengeId',
          embedUrl: 'mon-url.com',
          locale: 'bz',
          urlsToConsult: null,
        }),
      );
    });

    it('should fetch primary embed URL', async () => {
      // given
      const id = 'localizedChallengeId';
      databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeId,
        challengeId,
        embedUrl: 'http://mon-url.com/?lang=fr',
        locale: 'fr',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id,
        challengeId,
        embedUrl: null,
        locale: 'bz',
      });
      await databaseBuilder.commit();

      // when
      const localizedChallenge = await localizedChallengeRepository.get({ id });

      // then
      expect(localizedChallenge).toHaveProperty('defaultEmbedUrl', 'http://mon-url.com/?lang=bz');
    });

    context('when there is one attachment joined to localized challenge', () => {
      it('should return localized challenge with fileIds', async () => {
        // given
        const id = 'localizedChallengeId';
        databaseBuilder.factory.buildLocalizedChallenge({
          id: challengeId,
          challengeId,
          locale: 'fr',
        });
        const localizedChallengeBz = databaseBuilder.factory.buildLocalizedChallenge({
          id,
          challengeId,
          embedUrl: 'mon-url.com',
          locale: 'bz',
        });

        databaseBuilder.factory.buildAttachment(
          domainBuilder.buildAttachmentDatasourceObject({
            id: 'attachment-id-0',
            localizedChallengeId: localizedChallengeBz.id,
            challengeId,
          }),
        );
        await databaseBuilder.commit();

        // when
        const localizedChallenge = await localizedChallengeRepository.get({ id });

        // then
        expect(localizedChallenge).toStrictEqual(
          domainBuilder.buildLocalizedChallenge({
            id,
            challengeId: 'challengeId',
            embedUrl: 'mon-url.com',
            locale: 'bz',
            fileIds: ['attachment-id-0'],
            urlsToConsult: null,
          }),
        );
      });
    });

    context('when id does not exist', () => {
      it('should throw a NotFoundError', async () => {
        // given
        const id = 'unknownLocalizedChallengeId';

        // when
        const promise = localizedChallengeRepository.get({ id });

        // then
        await expect(promise).rejects.toStrictEqual(new NotFoundError('Épreuve ou langue introuvable'));
      });
    });
  });

  context('#update', () => {
    it('should change many attributes', async () => {
      // given
      const id = 'localizedChallengeId';
      databaseBuilder.factory.buildLocalizedChallenge({
        id,
        challengeId,
        embedUrl: 'my-url.html',
        locale: 'bz',
        geography: 'BZ',
        status: LocalizedChallenge.STATUSES.PRIMARY,
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: true,
        toRephrase: true,
        hasEmbedInternalValidation: false,
        noValidationNeeded: true,
        validatedAt: null,
      });
      await databaseBuilder.commit();

      const localizedChallenge = domainBuilder.buildLocalizedChallenge({
        id,
        challengeId: 'challengeId',
        embedUrl: 'my-new-url.html',
        locale: 'ar',
        status: LocalizedChallenge.STATUSES.PRIMARY,
        geography: 'AR',
        urlsToConsult: ['my-new-link'],
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
        isAwarenessChallenge: false,
        toRephrase: false,
        hasEmbedInternalValidation: true,
        noValidationNeeded: false,
        validatedAt: new Date('2021-01-01T18:00:00Z'),
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
          status: LocalizedChallenge.STATUSES.PRIMARY,
          geography: 'AR',
          urlsToConsult: ['my-new-link'],
          requireGafamWebsiteAccess: false,
          isIncompatibleIpadCertif: false,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
          isAwarenessChallenge: false,
          toRephrase: false,
          hasEmbedInternalValidation: true,
          noValidationNeeded: false,
          validatedAt: new Date('2021-01-01T18:00:00Z'),
        },
      ]);

      expect(localizedUpdatedChallenge).toStrictEqual(
        domainBuilder.buildLocalizedChallenge({
          id,
          challengeId: 'challengeId',
          embedUrl: 'my-new-url.html',
          locale: 'ar',
          status: LocalizedChallenge.STATUSES.PRIMARY,
          geography: 'AR',
          urlsToConsult: ['my-new-link'],
          requireGafamWebsiteAccess: false,
          isIncompatibleIpadCertif: false,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
          isAwarenessChallenge: false,
          toRephrase: false,
          hasEmbedInternalValidation: true,
          noValidationNeeded: false,
          validatedAt: new Date('2021-01-01T18:00:00Z'),
        }),
      );
    });

    it('should fetch primary embed URL after updating', async () => {
      // given
      const id = 'localizedChallengeId';
      databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeId,
        challengeId,
        embedUrl: 'https://my-url.com/path/to/page?lang=fr',
        locale: 'fr',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id,
        challengeId,
        embedUrl: null,
        locale: 'nl',
      });
      await databaseBuilder.commit();

      const localizedChallenge = domainBuilder.buildLocalizedChallenge({
        id,
        challengeId,
        embedUrl: null,
        locale: 'nl',
      });

      // when
      const localizedUpdatedChallenge = await localizedChallengeRepository.update({ localizedChallenge });

      // then
      expect(localizedUpdatedChallenge).toHaveProperty('defaultEmbedUrl', 'https://my-url.com/path/to/page?lang=nl');
    });

    context('when there is one attachment joined to localized challenge', () => {
      it('should change localized challenge locale and embedUrl with attachmentId', async () => {
        // given
        const id = 'localizedChallengeId';
        databaseBuilder.factory.buildLocalizedChallenge({
          id,
          challengeId,
          embedUrl: 'my-url.html',
          locale: 'bz',
          requireGafamWebsiteAccess: true,
          isIncompatibleIpadCertif: true,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
          isAwarenessChallenge: true,
          toRephrase: true,
          hasEmbedInternalValidation: true,
          noValidationNeeded: true,
        });

        await databaseBuilder.commit();

        const localizedChallenge = domainBuilder.buildLocalizedChallenge({
          id,
          challengeId: 'challengeId',
          embedUrl: 'my-new-url.html',
          locale: 'ar',
          status: LocalizedChallenge.STATUSES.PRIMARY,
          files: ['attachmentId'],
          urlsToConsult: null,
          requireGafamWebsiteAccess: false,
          isIncompatibleIpadCertif: false,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
          isAwarenessChallenge: false,
          toRephrase: false,
          hasEmbedInternalValidation: false,
          noValidationNeeded: true,
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
            status: LocalizedChallenge.STATUSES.PRIMARY,
            geography: 'AA',
            urlsToConsult: null,
            requireGafamWebsiteAccess: false,
            isIncompatibleIpadCertif: false,
            deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
            isAwarenessChallenge: false,
            toRephrase: false,
            hasEmbedInternalValidation: false,
            noValidationNeeded: true,
            validatedAt: null,
          },
        ]);

        expect(localizedUpdatedChallenge).toStrictEqual(
          domainBuilder.buildLocalizedChallenge({
            id,
            challengeId: 'challengeId',
            embedUrl: 'my-new-url.html',
            locale: 'ar',
            status: LocalizedChallenge.STATUSES.PRIMARY,
            files: ['attachmentId'],
            urlsToConsult: null,
            requireGafamWebsiteAccess: false,
            isIncompatibleIpadCertif: false,
            deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
            isAwarenessChallenge: false,
            toRephrase: false,
            hasEmbedInternalValidation: false,
            noValidationNeeded: true,
          }),
        );
      });
    });
  });
});
