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
      const challenge = domainBuilder.buildChallenge({
        id: 'idDuChallenge',
        locales: ['jp', 'fr', 'en'],
        geography: 'Japon',
        embedUrl: 'mon/embed.url',
      });

      // when
      const primaryLocalizedChallenge = LocalizedChallenge.buildPrimary(challenge);

      // then
      expect(primaryLocalizedChallenge).to.deep.equal({
        id: 'idDuChallenge',
        challengeId: 'idDuChallenge',
        embedUrl: 'mon/embed.url',
        fileIds: [],
        locale: 'en',
        status: null,
        geography: 'JP',
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
      });
    });
  });
});
