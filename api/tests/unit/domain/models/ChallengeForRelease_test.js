import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { ChallengeForRelease } from '../../../../lib/domain/models/release/index.js';

describe('Unit | Domain | ChallengeForRelease', () => {
  describe('#canExportForTranslation', () => {
    it('should return true when all conditions are reunited', () => {
      // given
      const challengeForRelease  = domainBuilder.buildChallengeForRelease({
        status: ChallengeForRelease.STATUSES.VALIDE,
        locales: ['fr', 'en'],
      });
      const locale = 'en';

      // when
      const result = challengeForRelease.canExportForTranslation(locale);

      // then
      expect(result).to.be.true;
    });

    it.each(Object.keys(ChallengeForRelease.STATUSES).filter((status) => ChallengeForRelease.STATUSES[status] !== ChallengeForRelease.STATUSES.VALIDE)
    )('should return false when status key is %s', (status) => {
      // given
      const challengeForRelease  = domainBuilder.buildChallengeForRelease({
        status,
        locales: ['fr', 'en'],
      });
      const locale = 'en';

      // when
      const result = challengeForRelease.canExportForTranslation(locale);

      // then
      expect(result).not.to.be.true;
    });

    it('should return false when locale is not included in challenge', () => {
      // given
      const challengeForRelease  = domainBuilder.buildChallengeForRelease({
        status: ChallengeForRelease.STATUSES.VALIDE,
        locales: ['fr', 'en'],
      });
      const locale = 'nl';

      // when
      const result = challengeForRelease.canExportForTranslation(locale);

      // then
      expect(result).not.to.be.true;
    });
  });

  describe('#get isOperative', () => {
    it.each(Object.values(ChallengeForRelease.STATUSES))('is "%s" is operative ?', (currentStatus) => {
      // given
      const challengeForRelease  = domainBuilder.buildChallengeForRelease({
        status: currentStatus,
      });
      const expectedIsOperative = [ChallengeForRelease.STATUSES.ARCHIVE, ChallengeForRelease.STATUSES.VALIDE].includes(currentStatus);

      // when
      const actual = challengeForRelease.isOperative;

      // then
      expect(actual).to.equal(expectedIsOperative);
    });
  });

  describe('#keep accessibility1 & 2 challenge properties for release', () => {
    it('should return the same accessibility properties in the release', () => {
      // given
      const challengeProperties = {
        accessibility1: 'KO',
        accessibility2: 'OK',
      };

      // when
      const challengeForRelease = domainBuilder.buildChallengeForRelease(challengeProperties);

      // then
      expect(challengeForRelease.accessibility1).to.equal('KO');
      expect(challengeForRelease.accessibility2).to.equal('OK');
    });
  });
});
