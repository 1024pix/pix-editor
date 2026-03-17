import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { ChallengeForRelease } from '../../../../lib/domain/models/release/index.js';

describe('Unit | Domain | ChallengeForRelease', () => {
  describe('#hasLocale', () => {
    it('returns whether challenge has given locale', () => {
      // given
      const challengeForRelease = domainBuilder.buildChallengeForRelease({ locales: ['fr', 'en'] });

      // then
      expect(challengeForRelease.hasLocale('fr')).toBe(true);
      expect(challengeForRelease.hasLocale('en')).toBe(true);
      expect(challengeForRelease.hasLocale('nl')).toBe(false);
      expect(challengeForRelease.hasLocale('fr-FR')).toBe(false);
    });
  });

  describe('#get isValide', () => {
    it.each([
      [ChallengeForRelease.STATUSES.ARCHIVE, false],
      [ChallengeForRelease.STATUSES.PERIME, false],
      [ChallengeForRelease.STATUSES.PROPOSE, false],
      [ChallengeForRelease.STATUSES.VALIDE, true],
    ])('returns $1 when status is $0', (status, expectedIsValide) => {
      // given
      const challengeForRelease = domainBuilder.buildChallengeForRelease({ status });

      // when
      const actual = challengeForRelease.isValide;

      // then
      expect(actual).toBe(expectedIsValide);
    });
  });

  describe('#get isOperative', () => {
    it.each([
      [ChallengeForRelease.STATUSES.ARCHIVE, true],
      [ChallengeForRelease.STATUSES.PERIME, false],
      [ChallengeForRelease.STATUSES.PROPOSE, false],
      [ChallengeForRelease.STATUSES.VALIDE, true],
    ])('returns $1 when status is $0', (status, expectedIsOperative) => {
      // given
      const challengeForRelease = domainBuilder.buildChallengeForRelease({ status });

      // when
      const actual = challengeForRelease.isOperative;

      // then
      expect(actual).toBe(expectedIsOperative);
    });
  });

  describe('#constructor', () => {
    it('should have accessibility1 & 2 properties in ChallengeForRelease', () => {
      // given
      const challengeProperties = {
        accessibility1: 'KO',
        accessibility2: 'OK',
      };

      // when
      const challengeForRelease = new ChallengeForRelease(challengeProperties);

      // then
      expect(challengeForRelease).to.have.property('accessibility1', 'KO');
      expect(challengeForRelease).to.have.property('accessibility2', 'OK');
    });
  });
});
