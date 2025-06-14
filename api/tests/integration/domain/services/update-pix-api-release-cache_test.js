import { afterEach, beforeEach, describe, describe as context, expect, it, vi } from 'vitest';
import nock from 'nock';
import { Attachment, Challenge, Framework, Tutorial } from '../../../../lib/domain/models/index.js';
import * as updatePixApiReleaseCache from '../../../../lib/domain/services/update-pix-api-release-cache.js';
import * as updatedRecordNotifier from '../../../../lib/infrastructure/event-notifier/updated-record-notifier.js';
import * as config from '../../../../lib/config.js';
import { airtableBuilder, databaseBuilder, domainBuilder } from '../../../test-helper.js';
import { challengeDatasource } from '../../../../lib/infrastructure/datasources/airtable/index.js';

describe('Integration | Service | update pix api release cache', function() {
  let notifyStub, originalPixApiUrlValue;

  beforeEach(() => {
    notifyStub = vi.spyOn(updatedRecordNotifier, 'notify');
    originalPixApiUrlValue = config.pixApi.baseUrl;
  });

  afterEach(function() {
    config.pixApi.baseUrl = originalPixApiUrlValue;
  });

  describe('#onAttachmentCreated', function() {

    context('when patchingPixApi is enabled', function() {

      beforeEach(function() {
        config.pixApi.baseUrl = 'https://some-api-base-url.fr';
      });

      context('when attachment is from the primary challenge', function() {
        it('should patch the primary challenge accordingly', async function() {
          // given
          const airtableChallenge = airtableBuilder.factory.buildChallenge({
            id: 'challengeIdA',
            locales: ['fr'],
          });
          databaseBuilder.factory.buildLocalizedChallenge({
            id: 'challengeIdA',
            challengeId: 'challengeIdA',
            locale: 'fr',
          });
          await databaseBuilder.commit();
          const airtableGetChallengeScope = nock('https://api.airtable.com')
            .get('/v0/airtableBaseValue/Epreuves')
            .query({
              filterByFormula: '{id persistant} = "challengeIdA"',
              maxRecords: '1'
            })
            .reply(200, {
              records: [
                airtableChallenge,
              ]
            });
          const airtableAttachmentA = airtableBuilder.factory.buildAttachment({
            id: 'airtableAttachmentIdA',
            type: Attachment.TYPES.ILLUSTRATION,
            url: 'http://url-illustration.com',
            challengeId: 'challengeIdA',
            airtableChallengeId: 'challengeAirtableIdA',
          });
          const airtableAttachmentB = airtableBuilder.factory.buildAttachment({
            id: 'airtableAttachmentIdB',
            type: Attachment.TYPES.ATTACHMENT,
            url: 'http://url-piecejointe.com',
            challengeId: 'challengeIdA',
            airtableChallengeId: 'challengeAirtableIdA',
          });
          const airtableFindAttachmentsScope = nock('https://api.airtable.com')
            .get('/v0/airtableBaseValue/Attachments')
            .query({
              filterByFormula: 'OR({localizedChallengeId} = "challengeIdA")',
            })
            .matchHeader('authorization', 'Bearer airtableApiKeyValue')
            .reply(200, { records: [airtableAttachmentA, airtableAttachmentB] });
          const pixApiToken = 'secret';
          nock('https://some-api-base-url.fr')
            .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
            .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
            .reply(200, { 'access_token': pixApiToken });
          const pixApiCacheScope = nock('https://some-api-base-url.fr')
            .patch('/api/cache/challenges/challengeIdA', {
              id: 'challengeIdA',
              alpha: null,
              alternativeInstruction: '',
              attachments: [ 'http://url-piecejointe.com' ],
              autoReply: false,
              competenceId: null,
              delta: null,
              embedUrl: null,
              embedTitle: '',
              format: 'mots',
              illustrationAlt: null,
              illustrationUrl: 'http://url-illustration.com',
              instruction: '',
              locales: [ 'fr' ],
              proposals: '',
              solution: '',
              solutionToDisplay: '',
              skillId: null,
              t1Status: false,
              t2Status: false,
              t3Status: false,
              requireGafamWebsiteAccess: false,
              isIncompatibleIpadCertif: false,
              deafAndHardOfHearing: 'RAS',
              isAwarenessChallenge: false,
              toRephrase: false,
              hasEmbedInternalValidation: false,
              noValidationNeeded: false
            })
            .matchHeader('Authorization', `Bearer ${pixApiToken}`)
            .reply(200);

          // when
          await updatePixApiReleaseCache.onAttachmentCreated(new Attachment({ challengeId: 'challengeIdA', localizedChallengeId: null }));

          // then
          expect(airtableGetChallengeScope.isDone()).to.be.true;
          expect(airtableFindAttachmentsScope.isDone()).to.be.true;
          expect(pixApiCacheScope.isDone()).to.be.true;
        });
      });

      context('when attachment is from a localized challenge', function() {
        it('should patch the translated challenge accordingly', async function() {
          // given
          const airtableChallenge = airtableBuilder.factory.buildChallenge({
            id: 'challengeIdA',
            locales: ['fr', 'es'],
          });
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
          await databaseBuilder.commit();
          const airtableGetChallengeScope = nock('https://api.airtable.com')
            .get('/v0/airtableBaseValue/Epreuves')
            .query({
              filterByFormula: '{id persistant} = "challengeIdA"',
              maxRecords: '1'
            })
            .reply(200, {
              records: [
                airtableChallenge,
              ]
            });
          const airtableAttachmentA = airtableBuilder.factory.buildAttachment({
            id: 'airtableAttachmentIdA',
            type: Attachment.TYPES.ILLUSTRATION,
            url: 'http://url-illustration.com',
            localizedChallengeId: 'challengeIdA_ES',
          });
          const airtableAttachmentB = airtableBuilder.factory.buildAttachment({
            id: 'airtableAttachmentIdB',
            type: Attachment.TYPES.ATTACHMENT,
            url: 'http://url-piecejointe.com',
            localizedChallengeId: 'challengeIdA_ES',
          });
          const airtableFindAttachmentsScope = nock('https://api.airtable.com')
            .get('/v0/airtableBaseValue/Attachments')
            .query({
              filterByFormula: 'OR({localizedChallengeId} = "challengeIdA_ES")',
            })
            .matchHeader('authorization', 'Bearer airtableApiKeyValue')
            .reply(200, { records: [airtableAttachmentA, airtableAttachmentB] });
          const pixApiToken = 'secret';
          nock('https://some-api-base-url.fr')
            .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
            .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
            .reply(200, { 'access_token': pixApiToken });
          const pixApiCacheScope = nock('https://some-api-base-url.fr')
            .patch('/api/cache/challenges/challengeIdA_ES', {
              id: 'challengeIdA_ES',
              alpha: null,
              alternativeInstruction: '',
              attachments: [ 'http://url-piecejointe.com' ],
              autoReply: false,
              competenceId: null,
              delta: null,
              embedUrl: null,
              embedTitle: '',
              format: 'mots',
              illustrationAlt: null,
              illustrationUrl: 'http://url-illustration.com',
              instruction: '',
              locales: [ 'es', 'fr' ],
              proposals: '',
              solution: '',
              solutionToDisplay: '',
              skillId: null,
              t1Status: false,
              t2Status: false,
              t3Status: false,
              requireGafamWebsiteAccess: false,
              isIncompatibleIpadCertif: false,
              deafAndHardOfHearing: 'RAS',
              isAwarenessChallenge: false,
              toRephrase: false,
              hasEmbedInternalValidation: false,
              noValidationNeeded: false
            })
            .matchHeader('Authorization', `Bearer ${pixApiToken}`)
            .reply(200);

          // when
          await updatePixApiReleaseCache.onAttachmentCreated(new Attachment({ challengeId: null, localizedChallengeId: 'challengeIdA_ES' }));

          // then
          expect(airtableGetChallengeScope.isDone()).to.be.true;
          expect(airtableFindAttachmentsScope.isDone()).to.be.true;
          expect(pixApiCacheScope.isDone()).to.be.true;
        });
      });
    });

    context('when patchingPixApi is disabled', function() {

      it('should not patch anything', async function() {
        // given
        config.pixApi.baseUrl = undefined;

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
        config.pixApi.baseUrl = 'https://some-api-base-url.fr';
      });

      context('when attachment is from the primary challenge', function() {
        it('should patch the primary challenge accordingly', async function() {
          // given
          const airtableChallenge = airtableBuilder.factory.buildChallenge({
            id: 'challengeIdA',
            locales: ['fr'],
          });
          databaseBuilder.factory.buildLocalizedChallenge({
            id: 'challengeIdA',
            challengeId: 'challengeIdA',
            locale: 'fr',
          });
          await databaseBuilder.commit();
          const airtableGetChallengeScope = nock('https://api.airtable.com')
            .get('/v0/airtableBaseValue/Epreuves')
            .query({
              filterByFormula: '{id persistant} = "challengeIdA"',
              maxRecords: '1'
            })
            .reply(200, {
              records: [
                airtableChallenge,
              ]
            });
          const airtableAttachmentA = airtableBuilder.factory.buildAttachment({
            id: 'airtableAttachmentIdA',
            type: Attachment.TYPES.ILLUSTRATION,
            url: 'http://url-illustration.com',
            challengeId: 'challengeIdA',
            airtableChallengeId: 'challengeAirtableIdA',
          });
          const airtableAttachmentB = airtableBuilder.factory.buildAttachment({
            id: 'airtableAttachmentIdB',
            type: Attachment.TYPES.ATTACHMENT,
            url: 'http://url-piecejointe.com',
            challengeId: 'challengeIdA',
            airtableChallengeId: 'challengeAirtableIdA',
          });
          const airtableFindAttachmentsScope = nock('https://api.airtable.com')
            .get('/v0/airtableBaseValue/Attachments')
            .query({
              filterByFormula: 'OR({localizedChallengeId} = "challengeIdA")',
            })
            .matchHeader('authorization', 'Bearer airtableApiKeyValue')
            .reply(200, { records: [airtableAttachmentA, airtableAttachmentB] });
          const pixApiToken = 'secret';
          nock('https://some-api-base-url.fr')
            .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
            .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
            .reply(200, { 'access_token': pixApiToken });
          const pixApiCacheScope = nock('https://some-api-base-url.fr')
            .patch('/api/cache/challenges/challengeIdA', {
              id: 'challengeIdA',
              alpha: null,
              alternativeInstruction: '',
              attachments: [ 'http://url-piecejointe.com' ],
              autoReply: false,
              competenceId: null,
              delta: null,
              embedUrl: null,
              embedTitle: '',
              format: 'mots',
              illustrationAlt: null,
              illustrationUrl: 'http://url-illustration.com',
              instruction: '',
              locales: [ 'fr' ],
              proposals: '',
              solution: '',
              solutionToDisplay: '',
              skillId: null,
              t1Status: false,
              t2Status: false,
              t3Status: false,
              requireGafamWebsiteAccess: false,
              isIncompatibleIpadCertif: false,
              deafAndHardOfHearing: 'RAS',
              isAwarenessChallenge: false,
              toRephrase: false,
              hasEmbedInternalValidation: false,
              noValidationNeeded: false
            })
            .matchHeader('Authorization', `Bearer ${pixApiToken}`)
            .reply(200);

          // when
          await updatePixApiReleaseCache.onAttachmentDeleted(new Attachment({ challengeId: 'challengeIdA', localizedChallengeId: null }));

          // then
          expect(airtableGetChallengeScope.isDone()).to.be.true;
          expect(airtableFindAttachmentsScope.isDone()).to.be.true;
          expect(pixApiCacheScope.isDone()).to.be.true;
        });
      });

      context('when attachment is from a localized challenge', function() {
        it('should patch the translated challenge accordingly', async function() {
          // given
          const airtableChallenge = airtableBuilder.factory.buildChallenge({
            id: 'challengeIdA',
            locales: ['fr', 'es'],
          });
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
          await databaseBuilder.commit();
          const airtableGetChallengeScope = nock('https://api.airtable.com')
            .get('/v0/airtableBaseValue/Epreuves')
            .query({
              filterByFormula: '{id persistant} = "challengeIdA"',
              maxRecords: '1'
            })
            .reply(200, {
              records: [
                airtableChallenge,
              ]
            });
          const airtableAttachmentA = airtableBuilder.factory.buildAttachment({
            id: 'airtableAttachmentIdA',
            type: Attachment.TYPES.ILLUSTRATION,
            url: 'http://url-illustration.com',
            localizedChallengeId: 'challengeIdA_ES',
          });
          const airtableAttachmentB = airtableBuilder.factory.buildAttachment({
            id: 'airtableAttachmentIdB',
            type: Attachment.TYPES.ATTACHMENT,
            url: 'http://url-piecejointe.com',
            localizedChallengeId: 'challengeIdA_ES',
          });
          const airtableFindAttachmentsScope = nock('https://api.airtable.com')
            .get('/v0/airtableBaseValue/Attachments')
            .query({
              filterByFormula: 'OR({localizedChallengeId} = "challengeIdA_ES")',
            })
            .matchHeader('authorization', 'Bearer airtableApiKeyValue')
            .reply(200, { records: [airtableAttachmentA, airtableAttachmentB] });
          const pixApiToken = 'secret';
          nock('https://some-api-base-url.fr')
            .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
            .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
            .reply(200, { 'access_token': pixApiToken });
          const pixApiCacheScope = nock('https://some-api-base-url.fr')
            .patch('/api/cache/challenges/challengeIdA_ES', {
              id: 'challengeIdA_ES',
              alpha: null,
              alternativeInstruction: '',
              attachments: [ 'http://url-piecejointe.com' ],
              autoReply: false,
              competenceId: null,
              delta: null,
              embedUrl: null,
              embedTitle: '',
              format: 'mots',
              illustrationAlt: null,
              illustrationUrl: 'http://url-illustration.com',
              instruction: '',
              locales: [ 'es', 'fr' ],
              proposals: '',
              solution: '',
              solutionToDisplay: '',
              skillId: null,
              t1Status: false,
              t2Status: false,
              t3Status: false,
              requireGafamWebsiteAccess: false,
              isIncompatibleIpadCertif: false,
              deafAndHardOfHearing: 'RAS',
              isAwarenessChallenge: false,
              toRephrase: false,
              hasEmbedInternalValidation: false,
              noValidationNeeded: false
            })
            .matchHeader('Authorization', `Bearer ${pixApiToken}`)
            .reply(200);

          // when
          await updatePixApiReleaseCache.onAttachmentDeleted(new Attachment({ challengeId: null, localizedChallengeId: 'challengeIdA_ES' }));

          // then
          expect(airtableGetChallengeScope.isDone()).to.be.true;
          expect(airtableFindAttachmentsScope.isDone()).to.be.true;
          expect(pixApiCacheScope.isDone()).to.be.true;
        });
      });
    });

    context('when patchingPixApi is disabled', function() {

      it('should not patch anything', async function() {
        // given
        config.pixApi.baseUrl = undefined;

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
        config.pixApi.baseUrl = 'https://some-api-base-url.fr';

        // when
        await updatePixApiReleaseCache.onAttachmentUpdated(new Attachment({ challengeId: 'challengeIdA' }));

        // then
        expect(notifyStub).toHaveBeenCalledTimes(0);
      });
    });

    context('when patchingPixApi is disabled', function() {
      it('not patch anything', async function() {
        // given
        config.pixApi.baseUrl = undefined;

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
        originalPixApiUrlValue = config.pixApi.baseUrl;
        config.pixApi.baseUrl = 'https://some-api-base-url.fr';
      });

      it('should patch the tutorial', async function() {
        // given
        const pixApiToken = 'secret';
        nock('https://some-api-base-url.fr')
          .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
          .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
          .reply(200, { 'access_token': pixApiToken });
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
        originalPixApiUrlValue = config.pixApi.baseUrl;
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
        originalPixApiUrlValue = config.pixApi.baseUrl;
        config.pixApi.baseUrl = 'https://some-api-base-url.fr';
      });

      it('should patch the tutorial', async function() {
        // given
        const pixApiToken = 'secret';
        nock('https://some-api-base-url.fr')
          .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
          .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
          .reply(200, { 'access_token': pixApiToken });
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
        originalPixApiUrlValue = config.pixApi.baseUrl;
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
        originalPixApiUrlValue = config.pixApi.baseUrl;
        config.pixApi.baseUrl = 'https://some-api-base-url.fr';
      });

      it('should patch the tutorial', async function() {
        // given
        const pixApiToken = 'secret';
        nock('https://some-api-base-url.fr')
          .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
          .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
          .reply(200, { 'access_token': pixApiToken });
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
        originalPixApiUrlValue = config.pixApi.baseUrl;
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
        config.pixApi.baseUrl = 'https://some-api-base-url.fr';
      });

      it('should patch the tube', async function() {
        // given
        const tube = domainBuilder.buildTube({
          thematicAirtableId: 'recThematicId',
          skillIds: [],
        });
        const thematic = domainBuilder.buildThematic({ id: 'thematic123', airtableId: 'recThematicId' });

        const pixApiToken = 'secret';
        nock('https://some-api-base-url.fr')
          .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
          .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
          .reply(200, { 'access_token': pixApiToken });
        const pixApiCacheScope = nock('https://some-api-base-url.fr')
          .patch(`/api/cache/tubes/${tube.id}`, {
            id: tube.id,
            name: tube.name,
            practicalTitle_i18n: tube.practicalTitle_i18n,
            practicalDescription_i18n: tube.practicalDescription_i18n,
            competenceId: tube.competenceId,
            thematicId: thematic.id,
            skillIds: [],
            isMobileCompliant: false,
            isTabletCompliant: false,
          })
          .matchHeader('Authorization', `Bearer ${pixApiToken}`)
          .reply(200);

        // when
        await updatePixApiReleaseCache.onTubeCreated(tube, thematic);

        // then
        expect(pixApiCacheScope.isDone()).to.be.true;
      });
    });

    context('when patching Pix API is disabled', function() {

      it('should not patch anything', async function() {
        // given
        config.pixApi.baseUrl = undefined;

        // when
        await updatePixApiReleaseCache.onTubeCreated(domainBuilder.buildTube(), domainBuilder.buildThematic());

        // then
        expect(notifyStub).not.toHaveBeenCalled();
      });
    });
  });

  describe('#onTubeUpdated', function() {
    context('when patching Pix API is enabled', function() {

      beforeEach(function() {
        config.pixApi.baseUrl = 'https://some-api-base-url.fr';
      });

      it('should patch the tube', async function() {
        // given
        const tube = domainBuilder.buildTube({ thematicAirtableId: 'recThematicId', });
        const thematic = domainBuilder.buildThematic({ id: 'thematic123', airtableId: 'recThematicId' });
        const challenge = domainBuilder.buildChallengeDatasourceObject({
          skillId: tube.skillIds[0],
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          status: Challenge.STATUSES.VALIDE,
          responsive: Challenge.RESPONSIVES.TABLETTE_ET_SMARTPHONE,
        });
        const airtableChallenge = airtableBuilder.factory.buildChallenge(challenge);

        databaseBuilder.factory.buildLocalizedChallenge({
          id: challenge.id,
          challengeId: challenge.id,
          locale: challenge.locales[0],
        });

        const airtableChallengesScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Epreuves')
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .query({
            fields: {
              '': challengeDatasource.usedFields,
            },
            filterByFormula: `AND(OR(${tube.skillIds.map((skillId) => `{Acquis (id persistant)} = "${skillId}"`).join(', ')}), {Généalogie} = "${Challenge.GENEALOGIES.PROTOTYPE}", {Statut} = "${Challenge.STATUSES.VALIDE}")`
          })
          .reply(200, {
            records: [airtableChallenge],
          });

        await databaseBuilder.commit();

        const pixApiToken = 'secret';
        nock('https://some-api-base-url.fr')
          .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
          .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
          .reply(200, { 'access_token': pixApiToken });
        const pixApiCacheScope = nock('https://some-api-base-url.fr')
          .patch(`/api/cache/tubes/${tube.id}`, {
            id: tube.id,
            name: tube.name,
            practicalTitle_i18n: tube.practicalTitle_i18n,
            practicalDescription_i18n: tube.practicalDescription_i18n,
            competenceId: tube.competenceId,
            thematicId: thematic.id,
            skillIds: tube.skillIds,
            isMobileCompliant: true,
            isTabletCompliant: true,
          })
          .matchHeader('Authorization', `Bearer ${pixApiToken}`)
          .reply(200);

        // when
        await updatePixApiReleaseCache.onTubeUpdated(tube, thematic);

        // then
        expect(pixApiCacheScope.isDone()).to.be.true;
        expect(airtableChallengesScope.isDone()).to.be.true;
      });
    });

    context('when patching Pix API is disabled', function() {

      it('should not patch anything', async function() {
        // given
        config.pixApi.baseUrl = undefined;

        // when
        await updatePixApiReleaseCache.onTubeUpdated(domainBuilder.buildTube());

        // then
        expect(notifyStub).not.toHaveBeenCalled();
      });
    });
  });
});
