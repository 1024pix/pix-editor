import { beforeEach, describe, describe as context, expect, it, vi } from 'vitest';
import nock from 'nock';
import {
  Area,
  Attachment,
  Challenge,
  Competence,
  Framework,
  Thematic,
  Tutorial,
} from '../../../../lib/domain/models/index.js';
import * as updatePixApiReleaseCache from '../../../../lib/domain/services/update-pix-api-release-cache.js';
import * as updatedRecordNotifier from '../../../../lib/infrastructure/event-notifier/updated-record-notifier.js';
import * as config from '../../../../lib/config.js';
import { databaseBuilder, domainBuilder } from '../../../test-helper.js';

describe('Integration | Service | update pix api release cache', function() {
  let notifyStub, baseUrl;

  beforeEach(() => {
    notifyStub = vi.spyOn(updatedRecordNotifier, 'notify');
    baseUrl = vi.spyOn(config.pixApi, 'baseUrl', 'get');
  });

  describe('#onAttachmentCreated', function() {
    context('when patchingPixApi is enabled', function() {
      beforeEach(function() {
        baseUrl.mockReturnValue('https://some-api-base-url.fr');
      });

      context('when attachment is from the primary challenge', function() {
        it('should patch the primary challenge accordingly', async function() {
          // given
          const challenge = domainBuilder.buildChallengeDatasourceObject({
            id: 'challengeIdA',
            locales: ['fr'],
            skillId: 'skill1',
            competenceId: 'competence1',
            files: [{ fileId: 'airtableAttachmentIdA', localizedChallengeId: 'challengeIdA' }, { fileId: 'airtableAttachmentIdB', localizedChallengeId: 'challengeIdA' }],
          });
          databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
          databaseBuilder.factory.buildArea({ id: 'recnrCmBiPXGbgIyQ', code: '1', frameworkId: 'recFmk1' });
          databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'recnrCmBiPXGbgIyQ' });
          databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
          databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
          databaseBuilder.factory.buildSkill({ id: 'skill1', tubeId: 'tube1' });
          databaseBuilder.factory.buildChallenge(challenge);
          databaseBuilder.factory.buildLocalizedChallenge({
            id: 'challengeIdA',
            challengeId: 'challengeIdA',
            locale: 'fr',
          });
          const attachments = [
            {
              id: 'airtableAttachmentIdA',
              type: Attachment.TYPES.ILLUSTRATION,
              url: 'http://url-illustration.com',
              challengeId: 'challengeIdA',
              airtableChallengeId: 'challengeAirtableIdA',
            },
            {
              id: 'airtableAttachmentIdB',
              type: Attachment.TYPES.ATTACHMENT,
              url: 'http://url-piecejointe.com',
              challengeId: 'challengeIdA',
              airtableChallengeId: 'challengeAirtableIdA',
            },
          ].map(domainBuilder.buildAttachmentDatasourceObject);
          attachments.map(databaseBuilder.factory.buildAttachment);
          await databaseBuilder.commit();
          const pixApiToken = 'secret';
          nock('https://some-api-base-url.fr')
            .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
            .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
            .reply(200, { access_token: pixApiToken });
          const pixApiCacheScope = nock('https://some-api-base-url.fr')
            .patch('/api/cache/challenges/challengeIdA', {
              id: 'challengeIdA',
              alpha: 0.5,
              alternativeInstruction: '',
              attachments: ['http://url-piecejointe.com'],
              autoReply: false,
              competenceId: 'competence1',
              delta: 0.2,
              embedUrl: null,
              embedTitle: '',
              embedHeight: 500,
              focusable: false,
              format: 'mots',
              genealogy: 'Prototype 1',
              illustrationAlt: null,
              illustrationUrl: 'http://url-illustration.com',
              instruction: '',
              locales: ['fr'],
              proposals: '',
              shuffled: false,
              responsive: 'Non',
              solution: '',
              solutionToDisplay: '',
              status: 'validé',
              skillId: 'skill1',
              t1Status: true,
              t2Status: false,
              t3Status: true,
              timer: 1234,
              type: 'QCM',
              shuffled: false,
              alternativeVersion: 2,
              accessibility1: 'OK',
              accessibility2: 'RAS',
              requireGafamWebsiteAccess: false,
              isIncompatibleIpadCertif: false,
              deafAndHardOfHearing: 'RAS',
              isAwarenessChallenge: false,
              toRephrase: false,
              hasEmbedInternalValidation: false,
              noValidationNeeded: false,
            })
            .matchHeader('Authorization', `Bearer ${pixApiToken}`)
            .reply(200);

          // when
          await updatePixApiReleaseCache.onAttachmentCreated(
            new Attachment({ challengeId: 'challengeIdA', localizedChallengeId: null }),
          );

          // then
          expect(pixApiCacheScope.isDone()).to.be.true;
        });
      });

      context('when attachment is from a localized challenge', function() {
        it('should patch the translated challenge accordingly', async function() {
          // given
          const challenge = domainBuilder.buildChallengeDatasourceObject({
            id: 'challengeIdA',
            locales: ['fr', 'es'],
            skillId: 'skill1',
            competenceId: 'competence1',
            files: [{ fileId: 'airtableAttachmentIdA', localizedChallengeId: 'challengeIdA_ES' }, { fileId: 'airtableAttachmentIdB', localizedChallengeId: 'challengeIdA_ES' }],
          });
          databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
          databaseBuilder.factory.buildArea({ id: 'recnrCmBiPXGbgIyQ', code: '1', frameworkId: 'recFmk1' });
          databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'recnrCmBiPXGbgIyQ' });
          databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
          databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
          databaseBuilder.factory.buildSkill({ id: 'skill1', tubeId: 'tube1' });
          databaseBuilder.factory.buildChallenge(challenge);
          databaseBuilder.factory.buildLocalizedChallenge({
            id: 'challengeIdA',
            challengeId: 'challengeIdA',
            locale: 'fr',
          });
          databaseBuilder.factory.buildLocalizedChallenge({
            id: 'challengeIdA_ES',
            challengeId: 'challengeIdA',
            locale: 'es',
          });
          const attachments = [
            {
              id: 'airtableAttachmentIdA',
              type: Attachment.TYPES.ILLUSTRATION,
              url: 'http://url-illustration.com',
              challengeId: 'challengeIdA',
              localizedChallengeId: 'challengeIdA_ES',
            },
            {
              id: 'airtableAttachmentIdB',
              type: Attachment.TYPES.ATTACHMENT,
              url: 'http://url-piecejointe.com',
              challengeId: 'challengeIdA',
              localizedChallengeId: 'challengeIdA_ES',
            },
          ].map(domainBuilder.buildAttachmentDatasourceObject);
          attachments.forEach(databaseBuilder.factory.buildAttachment);
          await databaseBuilder.commit();
          const pixApiToken = 'secret';
          nock('https://some-api-base-url.fr')
            .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
            .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
            .reply(200, { access_token: pixApiToken });
          const pixApiCacheScope = nock('https://some-api-base-url.fr')
            .patch('/api/cache/challenges/challengeIdA_ES', {
              id: 'challengeIdA_ES',
              alpha: 0.5,
              alternativeInstruction: '',
              attachments: ['http://url-piecejointe.com'],
              autoReply: false,
              competenceId: 'competence1',
              delta: 0.2,
              embedUrl: null,
              embedTitle: '',
              embedHeight: 500,
              focusable: false,
              format: 'mots',
              genealogy: 'Prototype 1',
              illustrationAlt: null,
              illustrationUrl: 'http://url-illustration.com',
              instruction: '',
              locales: ['es', 'fr'],
              proposals: '',
              responsive: 'Non',
              shuffled: false,
              solution: '',
              solutionToDisplay: '',
              status: 'validé',
              skillId: 'skill1',
              t1Status: true,
              t2Status: false,
              t3Status: true,
              timer: 1234,
              type: 'QCM',
              alternativeVersion: 2,
              accessibility1: 'OK',
              accessibility2: 'RAS',
              requireGafamWebsiteAccess: false,
              isIncompatibleIpadCertif: false,
              deafAndHardOfHearing: 'RAS',
              isAwarenessChallenge: false,
              toRephrase: false,
              hasEmbedInternalValidation: false,
              noValidationNeeded: false,
            })
            .matchHeader('Authorization', `Bearer ${pixApiToken}`)
            .reply(200);

          // when
          await updatePixApiReleaseCache.onAttachmentCreated(
            new Attachment({ challengeId: null, localizedChallengeId: 'challengeIdA_ES' }),
          );

          // then
          expect(pixApiCacheScope.isDone()).to.be.true;
        });
      });
    });

    context('when patchingPixApi is disabled', function() {
      it('should not patch anything', async function() {
        // given
        baseUrl.mockReturnValue(undefined);

        // when
        await updatePixApiReleaseCache.onAttachmentCreated(new Attachment({ challengeId: 'challengeIdA' }));

        // then
        expect(notifyStub).not.toHaveBeenCalled();
      });
    });
  });

  describe('#onAttachmentDeleted', function() {
    context('when patchingPixApi is enabled', function() {
      beforeEach(function() {
        baseUrl.mockReturnValue('https://some-api-base-url.fr');
      });

      context('when attachment is from the primary challenge', function() {
        it('should patch the primary challenge accordingly', async function() {
          // given
          const challenge = domainBuilder.buildChallengeDatasourceObject({
            id: 'challengeIdA',
            locales: ['fr'],
            skillId: 'skill1',
            competenceId: 'competence1',
            files: [{ fileId: 'airtableAttachmentIdA', localizedChallengeId: 'challengeIdA' }, { fileId: 'airtableAttachmentIdB', localizedChallengeId: 'challengeIdA' }],
          });
          databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
          databaseBuilder.factory.buildArea({ id: 'recnrCmBiPXGbgIyQ', code: '1', frameworkId: 'recFmk1' });
          databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'recnrCmBiPXGbgIyQ' });
          databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
          databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
          databaseBuilder.factory.buildSkill({ id: 'skill1', tubeId: 'tube1' });
          databaseBuilder.factory.buildChallenge(challenge);
          databaseBuilder.factory.buildLocalizedChallenge({
            id: 'challengeIdA',
            challengeId: 'challengeIdA',
            locale: 'fr',
          });
          const attachments = [
            {
              id: 'airtableAttachmentIdA',
              type: Attachment.TYPES.ILLUSTRATION,
              url: 'http://url-illustration.com',
              challengeId: 'challengeIdA',
              airtableChallengeId: 'challengeAirtableIdA',
            },
            {
              id: 'airtableAttachmentIdB',
              type: Attachment.TYPES.ATTACHMENT,
              url: 'http://url-piecejointe.com',
              challengeId: 'challengeIdA',
              airtableChallengeId: 'challengeAirtableIdA',
            },
          ].map(domainBuilder.buildAttachmentDatasourceObject);
          attachments.forEach(databaseBuilder.factory.buildAttachment);
          await databaseBuilder.commit();
          const pixApiToken = 'secret';
          nock('https://some-api-base-url.fr')
            .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
            .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
            .reply(200, { access_token: pixApiToken });
          const pixApiCacheScope = nock('https://some-api-base-url.fr')
            .patch('/api/cache/challenges/challengeIdA', {
              id: 'challengeIdA',
              alpha: 0.5,
              alternativeInstruction: '',
              attachments: ['http://url-piecejointe.com'],
              autoReply: false,
              competenceId: 'competence1',
              delta: 0.2,
              embedUrl: null,
              embedTitle: '',
              embedHeight: 500,
              focusable: false,
              format: 'mots',
              genealogy: 'Prototype 1',
              illustrationAlt: null,
              illustrationUrl: 'http://url-illustration.com',
              instruction: '',
              locales: ['fr'],
              proposals: '',
              responsive: 'Non',
              shuffled: false,
              solution: '',
              solutionToDisplay: '',
              status: 'validé',
              skillId: 'skill1',
              t1Status: true,
              t2Status: false,
              t3Status: true,
              timer: 1234,
              type: 'QCM',
              alternativeVersion: 2,
              accessibility1: 'OK',
              accessibility2: 'RAS',
              requireGafamWebsiteAccess: false,
              isIncompatibleIpadCertif: false,
              deafAndHardOfHearing: 'RAS',
              isAwarenessChallenge: false,
              toRephrase: false,
              hasEmbedInternalValidation: false,
              noValidationNeeded: false,
            })
            .matchHeader('Authorization', `Bearer ${pixApiToken}`)
            .reply(200);

          // when
          await updatePixApiReleaseCache.onAttachmentDeleted(
            new Attachment({ challengeId: 'challengeIdA', localizedChallengeId: null }),
          );

          // then
          expect(pixApiCacheScope.isDone()).to.be.true;
        });
      });

      context('when attachment is from a localized challenge', function() {
        it('should patch the translated challenge accordingly', async function() {
          // given
          const challenge = domainBuilder.buildChallengeDatasourceObject({
            id: 'challengeIdA',
            locales: ['fr', 'es'],
            skillId: 'skill1',
            competenceId: 'competence1',
            files: [{ fileId: 'airtableAttachmentIdA', localizedChallengeId: 'challengeIdA_ES' }, { fileId: 'airtableAttachmentIdB', localizedChallengeId: 'challengeIdA_ES' }],
          });
          databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
          databaseBuilder.factory.buildArea({ id: 'recnrCmBiPXGbgIyQ', code: '1', frameworkId: 'recFmk1' });
          databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'recnrCmBiPXGbgIyQ' });
          databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
          databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
          databaseBuilder.factory.buildSkill({ id: 'skill1', tubeId: 'tube1' });
          databaseBuilder.factory.buildChallenge(challenge);
          databaseBuilder.factory.buildLocalizedChallenge({
            id: 'challengeIdA',
            challengeId: 'challengeIdA',
            locale: 'fr',
          });
          databaseBuilder.factory.buildLocalizedChallenge({
            id: 'challengeIdA_ES',
            challengeId: 'challengeIdA',
            locale: 'es',
          });
          const attachments = [
            {
              id: 'airtableAttachmentIdA',
              type: Attachment.TYPES.ILLUSTRATION,
              url: 'http://url-illustration.com',
              challengeId: 'challengeIdA',
              localizedChallengeId: 'challengeIdA_ES',
            },
            {
              id: 'airtableAttachmentIdB',
              type: Attachment.TYPES.ATTACHMENT,
              url: 'http://url-piecejointe.com',
              challengeId: 'challengeIdA',
              localizedChallengeId: 'challengeIdA_ES',
            },
          ].map(domainBuilder.buildAttachmentDatasourceObject);
          attachments.forEach(databaseBuilder.factory.buildAttachment);
          await databaseBuilder.commit();
          const pixApiToken = 'secret';
          nock('https://some-api-base-url.fr')
            .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
            .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
            .reply(200, { access_token: pixApiToken });
          const pixApiCacheScope = nock('https://some-api-base-url.fr')
            .patch('/api/cache/challenges/challengeIdA_ES', {
              id: 'challengeIdA_ES',
              alpha: 0.5,
              alternativeInstruction: '',
              attachments: ['http://url-piecejointe.com'],
              autoReply: false,
              competenceId: 'competence1',
              delta: 0.2,
              embedUrl: null,
              embedTitle: '',
              embedHeight: 500,
              focusable: false,
              format: 'mots',
              genealogy: 'Prototype 1',
              illustrationAlt: null,
              illustrationUrl: 'http://url-illustration.com',
              instruction: '',
              locales: ['es', 'fr'],
              proposals: '',
              responsive: 'Non',
              shuffled: false,
              solution: '',
              solutionToDisplay: '',
              status: 'validé',
              skillId: 'skill1',
              t1Status: true,
              t2Status: false,
              t3Status: true,
              timer: 1234,
              type: 'QCM',
              alternativeVersion: 2,
              accessibility1: 'OK',
              accessibility2: 'RAS',
              requireGafamWebsiteAccess: false,
              isIncompatibleIpadCertif: false,
              deafAndHardOfHearing: 'RAS',
              isAwarenessChallenge: false,
              toRephrase: false,
              hasEmbedInternalValidation: false,
              noValidationNeeded: false,
            })
            .matchHeader('Authorization', `Bearer ${pixApiToken}`)
            .reply(200);

          // when
          await updatePixApiReleaseCache.onAttachmentDeleted(
            new Attachment({ challengeId: null, localizedChallengeId: 'challengeIdA_ES' }),
          );

          // then
          expect(pixApiCacheScope.isDone()).to.be.true;
        });
      });
    });

    context('when patchingPixApi is disabled', function() {
      it('should not patch anything', async function() {
        // given
        baseUrl.mockReturnValue(undefined);

        // when
        await updatePixApiReleaseCache.onAttachmentDeleted(new Attachment({ challengeId: 'challengeIdA' }));

        // then
        expect(notifyStub).not.toHaveBeenCalled();
      });
    });
  });

  describe('#onAttachmentUpdated', function() {
    context('when patchingPixApi is enabled', function() {
      it('not patch anything', async function() {
        // given
        baseUrl.mockReturnValue('https://some-api-base-url.fr');

        // when
        await updatePixApiReleaseCache.onAttachmentUpdated(new Attachment({ challengeId: 'challengeIdA' }));

        // then
        expect(notifyStub).toHaveBeenCalledTimes(0);
      });
    });

    context('when patchingPixApi is disabled', function() {
      it('not patch anything', async function() {
        // given
        baseUrl.mockReturnValue(undefined);

        // when
        await updatePixApiReleaseCache.onAttachmentUpdated(new Attachment({ challengeId: 'challengeIdA' }));

        // then
        expect(notifyStub).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('#onFrameworkCreated', function() {
    let framework;

    beforeEach(function() {
      framework = new Framework({
        id: 'frameworkABC123',
        name: 'Nom de mon framework',
        areaIds: ['areaId1', 'areaId2'],
      });
    });

    context('when patchingPixApi is enabled', function() {
      beforeEach(function() {
        baseUrl.mockReturnValue('https://some-api-base-url.fr');
      });

      it('should patch the tutorial', async function() {
        // given
        const pixApiToken = 'secret';
        nock('https://some-api-base-url.fr')
          .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
          .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
          .reply(200, { access_token: pixApiToken });
        const pixApiCacheScope = nock('https://some-api-base-url.fr')
          .patch('/api/cache/frameworks/frameworkABC123', {
            id: 'frameworkABC123',
            name: 'Nom de mon framework',
          })
          .matchHeader('Authorization', `Bearer ${pixApiToken}`)
          .reply(200);

        // when
        await updatePixApiReleaseCache.onFrameworkCreated(framework);

        // then
        expect(pixApiCacheScope.isDone()).to.be.true;
      });
    });

    context('when patchingPixApi is disabled', function() {
      beforeEach(function() {
        delete config.pixApi.baseUrl;
      });

      it('should not patch anything', async function() {
        // given
        const spy = vi.spyOn(updatedRecordNotifier, 'notify');

        // when
        await updatePixApiReleaseCache.onFrameworkCreated(framework);

        // then
        expect(spy).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('#onAreaCreated', function() {
    let area;

    beforeEach(function() {
      area = new Area({
        id: 'areaId',
        airtableId: 'recAreaId',
        code: '1',
        title_i18n: { fr: 'title fr areaId', en: 'title en areaId' },
        competenceIds: ['competenceId1', 'competenceId2'],
        competenceAirtableIds: ['recCompetenceId1', 'recCompetenceId2'],
        color: Area.COLORS.CERULEAN,
        frameworkId: 'frameworkId',
      });
    });

    context('when patchingPixApi is enabled', function() {
      beforeEach(function() {
        baseUrl.mockReturnValue('https://some-api-base-url.fr');
      });

      it('should patch the tutorial', async function() {
        // given
        const pixApiToken = 'secret';
        nock('https://some-api-base-url.fr')
          .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
          .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
          .reply(200, { access_token: pixApiToken });
        const pixApiCacheScope = nock('https://some-api-base-url.fr')
          .patch('/api/cache/areas/areaId', {
            id: 'areaId',
            code: '1',
            name: '1. title fr areaId',
            title_i18n: { fr: 'title fr areaId', en: 'title en areaId' },
            competenceIds: ['competenceId1', 'competenceId2'],
            color: Area.COLORS.CERULEAN,
            frameworkId: 'frameworkId',
          })
          .matchHeader('Authorization', `Bearer ${pixApiToken}`)
          .reply(200);

        // when
        await updatePixApiReleaseCache.onAreaCreated(area);

        // then
        expect(pixApiCacheScope.isDone()).to.be.true;
      });
    });

    context('when patchingPixApi is disabled', function() {
      beforeEach(function() {
        delete config.pixApi.baseUrl;
      });

      it('should not patch anything', async function() {
        // given
        const spy = vi.spyOn(updatedRecordNotifier, 'notify');

        // when
        await updatePixApiReleaseCache.onAreaCreated(area);

        // then
        expect(spy).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('#onCompetenceCreated', function() {
    let competence;

    beforeEach(function() {
      competence = new Competence({
        id: 'competenceId',
        airtableId: 'recCompetenceId',
        index: 1,
        origin: 'Pix+Fruits',
        areaId: 'areaId',
        areaAirtableId: 'recAreaId',
        thematicIds: ['thematicId1', 'thematicId2'],
        thematicAirtableIds: ['recThematicId1', 'recThematicId2'],
        tubeAirtableIds: ['recTubeId1', 'recTubeId2'],
        skillIds: ['skillId1', 'skillId2'],
        name_i18n: { fr: 'name fr competenceId', en: 'name en competenceId' },
        description_i18n: { fr: 'description fr competenceId', en: 'description en competenceId' },
      });
    });

    context('when patchingPixApi is enabled', function() {
      beforeEach(function() {
        baseUrl.mockReturnValue('https://some-api-base-url.fr');
      });

      it('should patch the tutorial', async function() {
        // given
        const pixApiToken = 'secret';
        nock('https://some-api-base-url.fr')
          .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
          .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
          .reply(200, { access_token: pixApiToken });
        const pixApiCacheScope = nock('https://some-api-base-url.fr')
          .patch('/api/cache/competences/competenceId', {
            id: 'competenceId',
            index: 1,
            origin: 'Pix+Fruits',
            areaId: 'areaId',
            thematicIds: ['thematicId1', 'thematicId2'],
            skillIds: ['skillId1', 'skillId2'],
            name_i18n: { fr: 'name fr competenceId', en: 'name en competenceId' },
            description_i18n: { fr: 'description fr competenceId', en: 'description en competenceId' },
          })
          .matchHeader('Authorization', `Bearer ${pixApiToken}`)
          .reply(200);

        // when
        await updatePixApiReleaseCache.onCompetenceCreated(competence);

        // then
        expect(pixApiCacheScope.isDone()).to.be.true;
      });
    });

    context('when patchingPixApi is disabled', function() {
      beforeEach(function() {
        delete config.pixApi.baseUrl;
      });

      it('should not patch anything', async function() {
        // given
        const spy = vi.spyOn(updatedRecordNotifier, 'notify');

        // when
        await updatePixApiReleaseCache.onCompetenceCreated(competence);

        // then
        expect(spy).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('#onCompetenceUpdated', function() {
    let competence;

    beforeEach(function() {
      competence = new Competence({
        id: 'competenceId',
        airtableId: 'recCompetenceId',
        index: 1,
        origin: 'Pix+Fruits',
        areaId: 'areaId',
        areaAirtableId: 'recAreaId',
        thematicIds: ['thematicId1', 'thematicId2'],
        thematicAirtableIds: ['recThematicId1', 'recThematicId2'],
        tubeAirtableIds: ['recTubeId1', 'recTubeId2'],
        skillIds: ['skillId1', 'skillId2'],
        name_i18n: { fr: 'name fr competenceId', en: 'name en competenceId' },
        description_i18n: { fr: 'description fr competenceId', en: 'description en competenceId' },
      });
    });

    context('when patchingPixApi is enabled', function() {
      beforeEach(function() {
        baseUrl.mockReturnValue('https://some-api-base-url.fr');
      });

      it('should patch the tutorial', async function() {
        // given
        const pixApiToken = 'secret';
        nock('https://some-api-base-url.fr')
          .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
          .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
          .reply(200, { access_token: pixApiToken });
        const pixApiCacheScope = nock('https://some-api-base-url.fr')
          .patch('/api/cache/competences/competenceId', {
            id: 'competenceId',
            index: 1,
            origin: 'Pix+Fruits',
            areaId: 'areaId',
            thematicIds: ['thematicId1', 'thematicId2'],
            skillIds: ['skillId1', 'skillId2'],
            name_i18n: { fr: 'name fr competenceId', en: 'name en competenceId' },
            description_i18n: { fr: 'description fr competenceId', en: 'description en competenceId' },
          })
          .matchHeader('Authorization', `Bearer ${pixApiToken}`)
          .reply(200);

        // when
        await updatePixApiReleaseCache.onCompetenceUpdated(competence);

        // then
        expect(pixApiCacheScope.isDone()).to.be.true;
      });
    });

    context('when patchingPixApi is disabled', function() {
      beforeEach(function() {
        delete config.pixApi.baseUrl;
      });

      it('should not patch anything', async function() {
        // given
        const spy = vi.spyOn(updatedRecordNotifier, 'notify');

        // when
        await updatePixApiReleaseCache.onCompetenceUpdated(competence);

        // then
        expect(spy).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('#onThematicCreated', function() {
    let thematic;

    beforeEach(function() {
      thematic = new Thematic({
        id: 'thematicId',
        airtableId: 'recThematicId',
        name_i18n: { fr: 'name fr thematicId', en: 'name en thematicId' },
        index: 1,
        competenceId: 'competenceId',
        competenceAirtableId: 'recCompetenceId',
        tubeIds: ['tubeId1', 'tubeId2'],
        tubeAirtableIds: ['recTubeId1', 'recTubeId2'],
      });
    });

    context('when patchingPixApi is enabled', function() {
      beforeEach(function() {
        baseUrl.mockReturnValue('https://some-api-base-url.fr');
      });

      it('should patch the tutorial', async function() {
        // given
        const pixApiToken = 'secret';
        nock('https://some-api-base-url.fr')
          .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
          .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
          .reply(200, { access_token: pixApiToken });
        const pixApiCacheScope = nock('https://some-api-base-url.fr')
          .patch('/api/cache/thematics/thematicId', {
            id: 'thematicId',
            name_i18n: { fr: 'name fr thematicId', en: 'name en thematicId' },
            index: 1,
            competenceId: 'competenceId',
            tubeIds: ['tubeId1', 'tubeId2'],
          })
          .matchHeader('Authorization', `Bearer ${pixApiToken}`)
          .reply(200);

        // when
        await updatePixApiReleaseCache.onThematicCreated(thematic);

        // then
        expect(pixApiCacheScope.isDone()).to.be.true;
      });
    });

    context('when patchingPixApi is disabled', function() {
      beforeEach(function() {
        delete config.pixApi.baseUrl;
      });

      it('should not patch anything', async function() {
        // given
        const spy = vi.spyOn(updatedRecordNotifier, 'notify');

        // when
        await updatePixApiReleaseCache.onThematicCreated(thematic);

        // then
        expect(spy).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('#onThematicUpdated', function() {
    let thematic;

    beforeEach(function() {
      thematic = new Thematic({
        id: 'thematicId',
        airtableId: 'recThematicId',
        name_i18n: { fr: 'name fr thematicId', en: 'name en thematicId' },
        index: 1,
        competenceId: 'competenceId',
        competenceAirtableId: 'recCompetenceId',
        tubeIds: ['tubeId1', 'tubeId2'],
        tubeAirtableIds: ['recTubeId1', 'recTubeId2'],
      });
    });

    context('when patchingPixApi is enabled', function() {
      beforeEach(function() {
        baseUrl.mockReturnValue('https://some-api-base-url.fr');
      });

      it('should patch the tutorial', async function() {
        // given
        const pixApiToken = 'secret';
        nock('https://some-api-base-url.fr')
          .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
          .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
          .reply(200, { access_token: pixApiToken });
        const pixApiCacheScope = nock('https://some-api-base-url.fr')
          .patch('/api/cache/thematics/thematicId', {
            id: 'thematicId',
            name_i18n: { fr: 'name fr thematicId', en: 'name en thematicId' },
            index: 1,
            competenceId: 'competenceId',
            tubeIds: ['tubeId1', 'tubeId2'],
          })
          .matchHeader('Authorization', `Bearer ${pixApiToken}`)
          .reply(200);

        // when
        await updatePixApiReleaseCache.onThematicUpdated(thematic);

        // then
        expect(pixApiCacheScope.isDone()).to.be.true;
      });
    });

    context('when patchingPixApi is disabled', function() {
      beforeEach(function() {
        delete config.pixApi.baseUrl;
      });

      it('should not patch anything', async function() {
        // given
        const spy = vi.spyOn(updatedRecordNotifier, 'notify');

        // when
        await updatePixApiReleaseCache.onThematicUpdated(thematic);

        // then
        expect(spy).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('#onTutorialCreated', function() {
    let tutorial;

    beforeEach(function() {
      tutorial = new Tutorial({
        id: 'tutorialId',
        airtableId: 'tutorialAirtableId',
        title: 'tutorial title',
        duration: 'tutorial duration',
        source: 'tutorial source',
        format: 'tutorial format',
        link: 'tutorial link',
        license: 'tutorial license',
        level: 'tutorial level',
        crush: 'tutorial crush',
        locale: 'tutorial locale',
        tagAirtableIds: ['tagAirtableId'],
      });
    });

    context('when patchingPixApi is enabled', function() {
      beforeEach(function() {
        baseUrl.mockReturnValue('https://some-api-base-url.fr');
      });

      it('should patch the tutorial', async function() {
        // given
        const pixApiToken = 'secret';
        nock('https://some-api-base-url.fr')
          .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
          .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
          .reply(200, { access_token: pixApiToken });
        const pixApiCacheScope = nock('https://some-api-base-url.fr')
          .patch('/api/cache/tutorials/tutorialId', {
            id: 'tutorialId',
            duration: 'tutorial duration',
            format: 'tutorial format',
            link: 'tutorial link',
            source: 'tutorial source',
            title: 'tutorial title',
            locale: 'tutorial locale',
          })
          .matchHeader('Authorization', `Bearer ${pixApiToken}`)
          .reply(200);

        // when
        await updatePixApiReleaseCache.onTutorialCreated(tutorial);

        // then
        expect(pixApiCacheScope.isDone()).to.be.true;
      });
    });

    context('when patchingPixApi is disabled', function() {
      beforeEach(function() {
        delete config.pixApi.baseUrl;
      });

      it('should not patch anything', async function() {
        // given
        const spy = vi.spyOn(updatedRecordNotifier, 'notify');

        // when
        await updatePixApiReleaseCache.onTutorialCreated(tutorial);

        // then
        expect(spy).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('#onTutorialUpdated', function() {
    let tutorial;

    beforeEach(function() {
      tutorial = new Tutorial({
        id: 'tutorialId',
        airtableId: 'tutorialAirtableId',
        title: 'tutorial title',
        duration: 'tutorial duration',
        source: 'tutorial source',
        format: 'tutorial format',
        link: 'tutorial link',
        license: 'tutorial license',
        level: 'tutorial level',
        crush: 'tutorial crush',
        locale: 'tutorial locale',
        tagAirtableIds: ['tagAirtableId'],
      });
    });

    context('when patchingPixApi is enabled', function() {
      beforeEach(function() {
        baseUrl.mockReturnValue('https://some-api-base-url.fr');
      });

      it('should patch the tutorial', async function() {
        // given
        const pixApiToken = 'secret';
        nock('https://some-api-base-url.fr')
          .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
          .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
          .reply(200, { access_token: pixApiToken });
        const pixApiCacheScope = nock('https://some-api-base-url.fr')
          .patch('/api/cache/tutorials/tutorialId', {
            id: 'tutorialId',
            duration: 'tutorial duration',
            format: 'tutorial format',
            link: 'tutorial link',
            source: 'tutorial source',
            title: 'tutorial title',
            locale: 'tutorial locale',
          })
          .matchHeader('Authorization', `Bearer ${pixApiToken}`)
          .reply(200);

        // when
        await updatePixApiReleaseCache.onTutorialUpdated(tutorial);

        // then
        expect(pixApiCacheScope.isDone()).to.be.true;
      });
    });

    context('when patchingPixApi is disabled', function() {
      beforeEach(function() {
        delete config.pixApi.baseUrl;
      });

      it('should not patch anything', async function() {
        // when
        await updatePixApiReleaseCache.onTutorialUpdated(tutorial);

        // then
        expect(notifyStub).not.toHaveBeenCalled();
      });
    });
  });

  describe('#onTubeCreated', function() {
    context('when patching Pix API is enabled', function() {
      beforeEach(function() {
        baseUrl.mockReturnValue('https://some-api-base-url.fr');
      });

      it('should patch the tube', async function() {
        // given
        const tube = domainBuilder.buildTube({ skillIds: [] });

        const pixApiToken = 'secret';
        nock('https://some-api-base-url.fr')
          .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
          .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
          .reply(200, { access_token: pixApiToken });
        const pixApiCacheScope = nock('https://some-api-base-url.fr')
          .patch(`/api/cache/tubes/${tube.id}`, {
            id: tube.id,
            name: tube.name,
            practicalTitle_i18n: tube.practicalTitle_i18n,
            practicalDescription_i18n: tube.practicalDescription_i18n,
            competenceId: tube.competenceId,
            thematicId: tube.thematicId,
            skillIds: [],
            isMobileCompliant: false,
            isTabletCompliant: false,
          })
          .matchHeader('Authorization', `Bearer ${pixApiToken}`)
          .reply(200);

        // when
        await updatePixApiReleaseCache.onTubeCreated(tube);

        // then
        expect(pixApiCacheScope.isDone()).to.be.true;
      });
    });

    context('when patching Pix API is disabled', function() {
      it('should not patch anything', async function() {
        // given
        baseUrl.mockReturnValue(undefined);

        // when
        await updatePixApiReleaseCache.onTubeCreated(domainBuilder.buildTube());

        // then
        expect(notifyStub).not.toHaveBeenCalled();
      });
    });
  });

  describe('#onTubeUpdated', function() {
    context('when patching Pix API is enabled', function() {
      beforeEach(function() {
        baseUrl.mockReturnValue('https://some-api-base-url.fr');
      });

      it('should patch the tube', async function() {
        // given
        const tube = domainBuilder.buildTube({ thematicId: 'thematic1', skillIds: ['skill1'] });
        const challenge = domainBuilder.buildChallengeDatasourceObject({
          id: 'challenge1',
          skillId: 'skill1',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          status: Challenge.STATUSES.VALIDE,
          responsive: Challenge.RESPONSIVES.TABLETTE_ET_SMARTPHONE,
          competenceId: 'competence1',
          files: [{ fileId: 'file1', localizedChallengeId: 'challenge1' }],
        });

        databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
        databaseBuilder.factory.buildArea({ id: 'recnrCmBiPXGbgIyQ', code: '1', frameworkId: 'recFmk1' });
        databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'recnrCmBiPXGbgIyQ' });
        databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
        databaseBuilder.factory.buildTube(tube);
        databaseBuilder.factory.buildSkill({ id: 'skill1', tubeId: tube.id });
        databaseBuilder.factory.buildChallenge(challenge);
        databaseBuilder.factory.buildLocalizedChallenge({
          id: challenge.id,
          challengeId: challenge.id,
          locale: challenge.locales[0],
        });
        const attachment = domainBuilder.buildAttachmentDatasourceObject({
          id: 'file1',
          localizedChallengeId: 'challenge1',
          challengeId: 'challenge1',
        });
        databaseBuilder.factory.buildAttachment(attachment);

        await databaseBuilder.commit();

        const pixApiToken = 'secret';
        nock('https://some-api-base-url.fr')
          .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
          .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
          .reply(200, { access_token: pixApiToken });
        const pixApiCacheScope = nock('https://some-api-base-url.fr')
          .patch(`/api/cache/tubes/${tube.id}`, {
            id: tube.id,
            name: tube.name,
            practicalTitle_i18n: tube.practicalTitle_i18n,
            practicalDescription_i18n: tube.practicalDescription_i18n,
            competenceId: tube.competenceId,
            thematicId: tube.thematicId,
            skillIds: tube.skillIds,
            isMobileCompliant: true,
            isTabletCompliant: true,
          })
          .matchHeader('Authorization', `Bearer ${pixApiToken}`)
          .reply(200);

        // when
        await updatePixApiReleaseCache.onTubeUpdated(tube);

        // then
        expect(pixApiCacheScope.isDone()).to.be.true;
      });
    });

    context('when patching Pix API is disabled', function() {
      it('should not patch anything', async function() {
        // given
        baseUrl.mockReturnValue(undefined);

        // when
        await updatePixApiReleaseCache.onTubeUpdated(domainBuilder.buildTube());

        // then
        expect(notifyStub).not.toHaveBeenCalled();
      });
    });
  });
});
