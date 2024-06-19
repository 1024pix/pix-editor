import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../tooling/domain-builder/domain-builder.js';
import { LocalizedChallenge } from '../../../../lib/domain/models/index.js';

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
        status: null,
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
        status: 'proposé',
        embedUrl: null,
        fileIds: [],
        geography: null,
        urlsToConsult: null,
      });
    });
  });

  describe('clone', function() {
    it('should return a cloned localized challenge', function() {
      // given
      const newId = 'newLocId';
      const newChallengeId = 'newChallengeId';
      const newStatus = LocalizedChallenge.STATUSES.PLAY;
      const localizedChallenge = domainBuilder.buildLocalizedChallenge({
        id: 'oldLocId',
        challengeId: 'oldChallengeId',
        embedUrl: 'https://example.com/embed.html',
        fileIds: ['ignore me'],
        locale: 'fr',
        status: LocalizedChallenge.STATUSES.PAUSE,
        geography: 'France',
        urlsToConsult: ['http://url.com'],
      });

      // when
      const clonedLocalizedChallenge = localizedChallenge.clone({ id: newId, challengeId: newChallengeId, status: newStatus });

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
    });
  });
});
