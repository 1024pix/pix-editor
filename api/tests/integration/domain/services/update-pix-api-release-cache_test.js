import { afterEach, beforeEach, describe, describe as context, expect, it, vi } from 'vitest';
import nock from 'nock';
import { Attachment } from '../../../../lib/domain/models/index.js';
import * as updatePixApiReleaseCache from '../../../../lib/domain/services/update-pix-api-release-cache.js';
import * as updatedRecordNotifier from '../../../../lib/infrastructure/event-notifier/updated-record-notifier.js';
import * as config from '../../../../lib/config.js';
import { airtableBuilder, databaseBuilder } from '../../../test-helper.js';

describe('Integration | Service | update pix api release cache', function() {
  let originalPixApiUrlValue;

  afterEach(function() {
    config.pixApi.baseUrl = originalPixApiUrlValue;
  });

  describe('#onAttachmentCreated', function() {

    context('when patchingPixApi is enabled', function() {

      beforeEach(function() {
        originalPixApiUrlValue = config.pixApi.baseUrl;
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
          await updatePixApiReleaseCache.onAttachmentCreated({ attachment: new Attachment({ challengeId: 'challengeIdA', localizedChallengeId: null }) });

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
          await updatePixApiReleaseCache.onAttachmentCreated({ attachment: new Attachment({ challengeId: null, localizedChallengeId: 'challengeIdA_ES' }) });

          // then
          expect(airtableGetChallengeScope.isDone()).to.be.true;
          expect(airtableFindAttachmentsScope.isDone()).to.be.true;
          expect(pixApiCacheScope.isDone()).to.be.true;
        });
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
        await updatePixApiReleaseCache.onAttachmentCreated({ attachment: new Attachment({ challengeId: 'challengeIdA' }) });

        // then
        expect(spy).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('#onAttachmentDeleted', function() {

    context('when patchingPixApi is enabled', function() {

      beforeEach(function() {
        originalPixApiUrlValue = config.pixApi.baseUrl;
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
          await updatePixApiReleaseCache.onAttachmentDeleted({ attachment: new Attachment({ challengeId: 'challengeIdA', localizedChallengeId: null }) });

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
          await updatePixApiReleaseCache.onAttachmentDeleted({ attachment: new Attachment({ challengeId: null, localizedChallengeId: 'challengeIdA_ES' }) });

          // then
          expect(airtableGetChallengeScope.isDone()).to.be.true;
          expect(airtableFindAttachmentsScope.isDone()).to.be.true;
          expect(pixApiCacheScope.isDone()).to.be.true;
        });
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
        await updatePixApiReleaseCache.onAttachmentDeleted({ attachment: new Attachment({ challengeId: 'challengeIdA' }) });

        // then
        expect(spy).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('#onAttachmentUpdated', function() {

    context('when patchingPixApi is enabled', function() {

      beforeEach(function() {
        originalPixApiUrlValue = config.pixApi.baseUrl;
        config.pixApi.baseUrl = 'https://some-api-base-url.fr';
      });

      it('not patch anything', async function() {
        // given
        const spy = vi.spyOn(updatedRecordNotifier, 'notify');

        // when
        await updatePixApiReleaseCache.onAttachmentUpdated({ attachment: new Attachment({ challengeId: 'challengeIdA' }) });

        // then
        expect(spy).toHaveBeenCalledTimes(0);
      });
    });

    context('when patchingPixApi is disabled', function() {

      beforeEach(function() {
        originalPixApiUrlValue = config.pixApi.baseUrl;
        delete config.pixApi.baseUrl;
      });

      it('not patch anything', async function() {
        // given
        const spy = vi.spyOn(updatedRecordNotifier, 'notify');

        // when
        await updatePixApiReleaseCache.onAttachmentUpdated({ attachment: new Attachment({ challengeId: 'challengeIdA' }) });

        // then
        expect(spy).toHaveBeenCalledTimes(0);
      });
    });
  });
});
