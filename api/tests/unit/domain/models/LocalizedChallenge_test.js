import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../tooling/domain-builder/domain-builder.js';
import { Attachment, LocalizedChallenge } from '../../../../lib/domain/models/index.js';

describe('Unit | Domain | LocalizedChallenge', () => {
  describe('#isPrimary', () => {
    it('should return true if id is the same as challengeId, false otherwise', () => {
      // given
      const primaryLocalizedChallenge = domainBuilder.buildLocalizedChallenge({
        id: 'challengeId',
        challengeId: 'challengeId',
      });
      const alternativeLocalizedChallenge = domainBuilder.buildLocalizedChallenge({
        id: 'alternativeId',
        challengeId: 'challengeId',
      });

      // then
      expect(primaryLocalizedChallenge.isPrimary).toBe(true);
      expect(alternativeLocalizedChallenge.isPrimary).toBe(false);
    });
  });

  describe('#defaultEmbedUrl', () => {
    describe('when URL uses query param for locale', () => {
      it('should compute default embed URL from primary embed URL', () => {
        // given
        const localizedChallenge = domainBuilder.buildLocalizedChallenge({
          id: 'alternativeId',
          challengeId: 'challengeId',
          locale: 'ar',
          primaryEmbedUrl: 'http://test.com/path/to/page.html?lang=fr',
        });

        // then
        expect(localizedChallenge).toHaveProperty('defaultEmbedUrl', 'http://test.com/path/to/page.html?lang=ar');
      });
    });

    describe('when URL uses path param for locale', () => {
      it('should compute default embed URL from primary embed URL', () => {
        // given
        const localizedChallenge = domainBuilder.buildLocalizedChallenge({
          id: 'alternativeId',
          challengeId: 'challengeId',
          locale: 'ar',
          primaryEmbedUrl: 'http://test.com/fr/path/to/page.html',
        });

        // then
        expect(localizedChallenge).toHaveProperty('defaultEmbedUrl', 'http://test.com/ar/path/to/page.html');
      });
    });

    describe('when URL doesn\'t have explicit locale', () => {
      it('should compute default embed URL from primary embed URL', () => {
        // given
        const localizedChallenge = domainBuilder.buildLocalizedChallenge({
          id: 'alternativeId',
          challengeId: 'challengeId',
          locale: 'ar',
          primaryEmbedUrl: 'http://test.com/pix-embed/to/page.html',
        });

        // then
        expect(localizedChallenge).toHaveProperty('defaultEmbedUrl', 'http://test.com/pix-embed/to/page.html?lang=ar');
      });
    });
  });

  describe('static buildPrimary', function() {
    it('should build a primary localized challenge', function() {
      // given
      const challengeId = 'idDuChallenge';
      const locale = 'en';
      const embedUrl = 'mon/embed.url';
      const geography = 'JP';
      const urlsToConsult = 'http://mon-url-a-consulter.com';

      // when
      const primaryLocalizedChallenge = LocalizedChallenge.buildPrimary({
        challengeId,
        locale,
        embedUrl,
        geography,
        urlsToConsult,
      });

      // then
      expect(primaryLocalizedChallenge).to.deep.equal({
        id: 'idDuChallenge',
        challengeId: 'idDuChallenge',
        embedUrl: 'mon/embed.url',
        fileIds: [],
        locale: 'en',
        status: LocalizedChallenge.STATUSES.PRIMARY,
        geography: 'JP',
        urlsToConsult: 'http://mon-url-a-consulter.com',
      });
    });
  });

  describe('static buildAlternativeFromTranslation', function() {
    it('should build an alternative localized challenge', function() {
      // given
      const translation = domainBuilder.buildTranslation({
        key: 'challenge.idDuChallenge.field',
        locale: 'fr',
      });

      // when
      const primaryLocalizedChallenge = LocalizedChallenge.buildAlternativeFromTranslation(translation);

      // then
      expect(primaryLocalizedChallenge).to.deep.equal({
        id: null,
        challengeId: 'idDuChallenge',
        locale: 'fr',
        status: LocalizedChallenge.STATUSES.PAUSE,
        embedUrl: null,
        fileIds: [],
        geography: null,
        urlsToConsult: null,
      });
    });
  });

  describe('clone', function() {
    it('should return a cloned localized challenge and its cloned attachments', function() {
      // given
      const newId = 'newChallengeId';
      const newChallengeId = 'newChallengeId';
      const newStatus = LocalizedChallenge.STATUSES.PLAY;
      const localizedChallenge = domainBuilder.buildLocalizedChallenge({
        id: 'oldLocId',
        challengeId: 'oldLocId',
        embedUrl: 'https://example.com/embed.html',
        fileIds: ['attachmentA', 'attachmentB'],
        locale: 'fr',
        status: LocalizedChallenge.STATUSES.PAUSE,
        geography: 'France',
        urlsToConsult: ['http://url.com'],
      });
      const attachments = [
        domainBuilder.buildAttachment({ id: 'someIrrelevantAttachment' }),
        domainBuilder.buildAttachment({
          id: 'attachmentA',
          url: 'https://www.attA.com',
          type: Attachment.TYPES.ILLUSTRATION,
          alt: 'osef',
          size: 123,
          mimeType: 'image/png',
          filename: 'fraise_des_bois',
          localizedChallengeId: 'oldLocId',
        }),
        domainBuilder.buildAttachment({
          id: 'attachmentB',
          url: 'https://www.attB.com',
          type: Attachment.TYPES.ATTACHMENT,
          alt: 'osef le retour',
          size: 456,
          mimeType: 'text/csv',
          filename: 'liste_de_courses',
          localizedChallengeId: 'oldLocId',
        }),
      ];

      // when
      const { clonedLocalizedChallenge, clonedAttachments } = localizedChallenge.clone({ id: newId, challengeId: newChallengeId, status: newStatus, attachments });

      // then
      const expectedLocalizedChallenge = domainBuilder.buildLocalizedChallenge({
        id: newId,
        challengeId: newChallengeId,
        embedUrl: localizedChallenge.embedUrl,
        fileIds: [],
        locale: localizedChallenge.locale,
        status: newStatus,
        geography: localizedChallenge.geography,
        urlsToConsult: localizedChallenge.urlsToConsult,
      });
      expect(clonedLocalizedChallenge).toStrictEqual(expectedLocalizedChallenge);
      expect(clonedAttachments).toStrictEqual([
        domainBuilder.buildAttachment({
          id: null,
          url: 'https://www.attA.com',
          type: Attachment.TYPES.ILLUSTRATION,
          alt: 'osef',
          size: 123,
          mimeType: 'image/png',
          filename: 'fraise_des_bois',
          challengeId: newChallengeId,
          localizedChallengeId: newId,
        }),
        domainBuilder.buildAttachment({
          id: null,
          url: 'https://www.attB.com',
          type: Attachment.TYPES.ATTACHMENT,
          alt: 'osef le retour',
          size: 456,
          mimeType: 'text/csv',
          filename: 'liste_de_courses',
          challengeId: newChallengeId,
          localizedChallengeId: newId,
        }),
      ]);
    });
  });
});
