import { afterEach, beforeEach, describe, describe as context, expect, it, vi } from 'vitest';
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

    describe("when URL doesn't have explicit locale", () => {
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

    describe('when URL is invalid', () => {
      it('should be null', () => {
        // given
        const localizedChallenge = domainBuilder.buildLocalizedChallenge({
          id: 'alternativeId',
          challengeId: 'challengeId',
          locale: 'ai',
          primaryEmbedUrl: '<iframe src="https://figma.com/want-to-use-our-ai"></iframe>',
        });

        // then
        expect(localizedChallenge).toHaveProperty('defaultEmbedUrl', null);
      });
    });

    describe('when primaryEmbedUrl is null', () => {
      it('should be null', () => {
        // given
        const localizedChallenge = domainBuilder.buildLocalizedChallenge({
          id: 'alternativeId',
          challengeId: 'challengeId',
          locale: 'ai',
          primaryEmbedUrl: null,
        });

        // then
        expect(localizedChallenge).toHaveProperty('defaultEmbedUrl', null);
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
      const requireGafamWebsiteAccess = true;
      const isIncompatibleIpadCertif = true;
      const deafAndHardOfHearing = LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK;
      const isAwarenessChallenge = true;
      const toRephrase = true;
      const hasEmbedInternalValidation = true;
      const noValidationNeeded = true;

      // when
      const primaryLocalizedChallenge = LocalizedChallenge.buildPrimary({
        challengeId,
        locale,
        embedUrl,
        geography,
        urlsToConsult,
        requireGafamWebsiteAccess,
        isIncompatibleIpadCertif,
        deafAndHardOfHearing,
        isAwarenessChallenge,
        toRephrase,
        hasEmbedInternalValidation,
        noValidationNeeded,
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
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: true,
        toRephrase: true,
        hasEmbedInternalValidation: true,
        noValidationNeeded: true,
        validatedAt: null,
      });
    });
    it('should build a primary localized challenge with default values when some not filled', function() {
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
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.RAS,
        isAwarenessChallenge: false,
        toRephrase: false,
        hasEmbedInternalValidation: false,
        noValidationNeeded: false,
        validatedAt: null,
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
        geography: 'AA',
        urlsToConsult: null,
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.RAS,
        isAwarenessChallenge: false,
        toRephrase: false,
        hasEmbedInternalValidation: false,
        noValidationNeeded: false,
        validatedAt: null,
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
        geography: 'FR',
        urlsToConsult: ['http://url.com'],
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: true,
        toRephrase: true,
        hasEmbedInternalValidation: true,
        noValidationNeeded: true,
        validatedAt: new Date('2020-01-01'),
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
      const { clonedLocalizedChallenge, clonedAttachments } = localizedChallenge.clone({
        id: newId,
        challengeId: newChallengeId,
        status: newStatus,
        attachments,
      });

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
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: true,
        toRephrase: true,
        hasEmbedInternalValidation: true,
        noValidationNeeded: true,
        validatedAt: null,
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
          airtableChallengeId: null,
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
          airtableChallengeId: null,
        }),
      ]);
    });

    describe('when validatedAt is filled', function() {
      it('should return a localized challenge with the given validatedAt', function() {
        // given
        const localizedChallenge = domainBuilder.buildLocalizedChallenge({
          id: 'oldLocId',
          challengeId: 'oldLocId',
          embedUrl: 'https://example.com/embed.html',
          fileIds: [],
          locale: 'fr',
          status: LocalizedChallenge.STATUSES.PAUSE,
          geography: 'FR',
          urlsToConsult: ['http://url.com'],
          requireGafamWebsiteAccess: true,
          isIncompatibleIpadCertif: true,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
          isAwarenessChallenge: true,
          toRephrase: true,
          hasEmbedInternalValidation: true,
          noValidationNeeded: true,
          validatedAt: new Date('2020-01-01'),
        });

        // when
        const { clonedLocalizedChallenge } = localizedChallenge.clone({
          id: 'newLocId',
          challengeId: 'newLocId',
          status: LocalizedChallenge.STATUSES.PLAY,
          attachments: [],
          validatedAt: new Date('2023-03-03'),
        });

        // then
        expect(clonedLocalizedChallenge).toStrictEqual(domainBuilder.buildLocalizedChallenge({
          ...localizedChallenge,
          id: 'newLocId',
          challengeId: 'newLocId',
          status: LocalizedChallenge.STATUSES.PLAY,
          attachments: [],
          validatedAt: new Date('2023-03-03'),
        }));
      });
    });
  });

  describe('update', function() {
    it('should update some fields', function() {
      // given
      const localizedChallenge = domainBuilder.buildLocalizedChallenge({
        id: 'old id',
        challengeId: 'old challengeId',
        embedUrl: 'old embedUrl',
        primaryEmbedUrl: 'old primaryEmbedUrl',
        fileIds: ['old fileIds'],
        locale: 'old locale',
        status: LocalizedChallenge.STATUSES.PAUSE,
        geography: 'old geography',
        urlsToConsult: ['old urlsToConsult'],
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.RAS,
        isAwarenessChallenge: false,
        toRephrase: false,
        hasEmbedInternalValidation: false,
        noValidationNeeded: false,
        validatedAt: new Date('2020-01-01T00:00:00Z'),
      });
      const localizedChallengeUpdates = domainBuilder.buildLocalizedChallenge({
        id: 'new id',
        challengeId: 'new challengeId',
        embedUrl: 'new embedUrl',
        primaryEmbedUrl: 'new primaryEmbedUrl',
        fileIds: ['new fileIds'],
        locale: 'new locale',
        status: LocalizedChallenge.STATUSES.PRIMARY,
        geography: 'new geography',
        urlsToConsult: ['new urlsToConsult'],
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: true,
        toRephrase: true,
        hasEmbedInternalValidation: true,
        noValidationNeeded: true,
        validatedAt: new Date('2023-03-03T00:00:00Z'),
      });

      // when
      localizedChallenge.update(localizedChallengeUpdates);

      // then
      expect(localizedChallenge).toStrictEqual(
        domainBuilder.buildLocalizedChallenge({
          id: 'old id',
          challengeId: 'old challengeId',
          embedUrl: 'new embedUrl',
          primaryEmbedUrl: 'old primaryEmbedUrl',
          fileIds: ['old fileIds'],
          locale: 'new locale',
          status: LocalizedChallenge.STATUSES.PRIMARY,
          geography: 'new geography',
          urlsToConsult: ['new urlsToConsult'],
          requireGafamWebsiteAccess: true,
          isIncompatibleIpadCertif: true,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
          isAwarenessChallenge: true,
          toRephrase: true,
          hasEmbedInternalValidation: true,
          noValidationNeeded: true,
          validatedAt: new Date('2020-01-01T00:00:00Z'),
        }),
      );
    });

    context('validatedAt', function() {
      let now;
      beforeEach(function() {
        now = new Date('2024-10-29T03:04:00Z');
        vi.useFakeTimers({
          now,
          toFake: ['Date'],
        });
      });

      afterEach(function() {
        vi.useRealTimers();
      });

      it('should set the date of validatedAt when localized challenge comes from any different status to PLAY', function() {
        // given
        const localizedChallengePrimary = domainBuilder.buildLocalizedChallenge({
          status: LocalizedChallenge.STATUSES.PRIMARY,
          validatedAt: new Date('2020-01-01'),
        });
        const localizedChallengePause = domainBuilder.buildLocalizedChallenge({
          status: LocalizedChallenge.STATUSES.PAUSE,
          validatedAt: new Date('2020-01-01'),
        });
        const localizedChallengeUpdates = domainBuilder.buildLocalizedChallenge({
          status: LocalizedChallenge.STATUSES.PLAY,
          validatedAt: new Date('1990-01-01'),
        });

        // when
        localizedChallengePrimary.update(localizedChallengeUpdates);
        localizedChallengePause.update(localizedChallengeUpdates);

        // then
        expect(localizedChallengePrimary.validatedAt).toStrictEqual(now);
        expect(localizedChallengePause.validatedAt).toStrictEqual(now);
      });

      it('should leave untouched the date of validatedAt when localized challenge is already in status PLAY', function() {
        // given
        const originalValidatedAt = new Date('2020-01-01');
        const localizedChallengePlay1 = domainBuilder.buildLocalizedChallenge({
          status: LocalizedChallenge.STATUSES.PLAY,
          validatedAt: originalValidatedAt,
        });
        const localizedChallengePlay2 = domainBuilder.buildLocalizedChallenge({
          status: LocalizedChallenge.STATUSES.PLAY,
          validatedAt: originalValidatedAt,
        });
        const localizedChallengePlay3 = domainBuilder.buildLocalizedChallenge({
          status: LocalizedChallenge.STATUSES.PLAY,
          validatedAt: originalValidatedAt,
        });
        const localizedChallengeUpdatesPlay = domainBuilder.buildLocalizedChallenge({
          status: LocalizedChallenge.STATUSES.PLAY,
          validatedAt: new Date('1990-01-01'),
        });
        const localizedChallengeUpdatesPause = domainBuilder.buildLocalizedChallenge({
          status: LocalizedChallenge.STATUSES.PAUSE,
          validatedAt: new Date('1990-01-01'),
        });
        const localizedChallengeUpdatesPrimary = domainBuilder.buildLocalizedChallenge({
          status: LocalizedChallenge.STATUSES.PRIMARY,
          validatedAt: new Date('1990-01-01'),
        });

        // when
        localizedChallengePlay1.update(localizedChallengeUpdatesPlay);
        localizedChallengePlay2.update(localizedChallengeUpdatesPause);
        localizedChallengePlay3.update(localizedChallengeUpdatesPrimary);

        // then
        expect(localizedChallengePlay1.validatedAt).toStrictEqual(originalValidatedAt);
        expect(localizedChallengePlay2.validatedAt).toStrictEqual(originalValidatedAt);
        expect(localizedChallengePlay3.validatedAt).toStrictEqual(originalValidatedAt);
      });

      it('should leave untouched the date of validatedAt when localized challenge changes to a status different than PLAY', function() {
        // given
        const originalValidatedAt = new Date('2020-01-01');
        const localizedChallengePlay1 = domainBuilder.buildLocalizedChallenge({
          status: LocalizedChallenge.STATUSES.PLAY,
          validatedAt: originalValidatedAt,
        });
        const localizedChallengePlay2 = domainBuilder.buildLocalizedChallenge({
          status: LocalizedChallenge.STATUSES.PLAY,
          validatedAt: originalValidatedAt,
        });
        const localizedChallengePause1 = domainBuilder.buildLocalizedChallenge({
          status: LocalizedChallenge.STATUSES.PAUSE,
          validatedAt: originalValidatedAt,
        });
        const localizedChallengePause2 = domainBuilder.buildLocalizedChallenge({
          status: LocalizedChallenge.STATUSES.PAUSE,
          validatedAt: originalValidatedAt,
        });
        const localizedChallengePrimary1 = domainBuilder.buildLocalizedChallenge({
          status: LocalizedChallenge.STATUSES.PRIMARY,
          validatedAt: originalValidatedAt,
        });
        const localizedChallengePrimary2 = domainBuilder.buildLocalizedChallenge({
          status: LocalizedChallenge.STATUSES.PRIMARY,
          validatedAt: originalValidatedAt,
        });
        const localizedChallengeUpdatesPause = domainBuilder.buildLocalizedChallenge({
          status: LocalizedChallenge.STATUSES.PAUSE,
          validatedAt: new Date('1990-01-01'),
        });
        const localizedChallengeUpdatesPrimary = domainBuilder.buildLocalizedChallenge({
          status: LocalizedChallenge.STATUSES.PRIMARY,
          validatedAt: new Date('1990-01-01'),
        });

        // when
        localizedChallengePlay1.update(localizedChallengeUpdatesPause);
        localizedChallengePlay2.update(localizedChallengeUpdatesPrimary);
        localizedChallengePause1.update(localizedChallengeUpdatesPause);
        localizedChallengePause2.update(localizedChallengeUpdatesPrimary);
        localizedChallengePrimary1.update(localizedChallengeUpdatesPause);
        localizedChallengePrimary2.update(localizedChallengeUpdatesPrimary);

        // then
        expect(localizedChallengePlay1.validatedAt).toStrictEqual(originalValidatedAt);
        expect(localizedChallengePlay2.validatedAt).toStrictEqual(originalValidatedAt);
        expect(localizedChallengePause1.validatedAt).toStrictEqual(originalValidatedAt);
        expect(localizedChallengePause2.validatedAt).toStrictEqual(originalValidatedAt);
        expect(localizedChallengePrimary1.validatedAt).toStrictEqual(originalValidatedAt);
        expect(localizedChallengePrimary2.validatedAt).toStrictEqual(originalValidatedAt);
      });
    });
  });
});
