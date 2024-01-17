import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../tooling/domain-builder/domain-builder.js';

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
});
