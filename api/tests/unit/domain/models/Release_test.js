import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { ChallengeForRelease } from '../../../../lib/domain/models/release/index.js';

describe('Unit | Domain | Release', () => {
  describe('#get operativeChallenges', () => {
    it('should only return operative challenges', () => {
      // given
      const release = domainBuilder.buildDomainRelease.withContent({
        challengesFromRelease: [
          domainBuilder.buildChallengeForRelease({ id: 'valideChal0', status: ChallengeForRelease.STATUSES.VALIDE }),
          domainBuilder.buildChallengeForRelease({ id: 'perimeChal0', status: ChallengeForRelease.STATUSES.PERIME }),
          domainBuilder.buildChallengeForRelease({ id: 'proposeChal0', status: ChallengeForRelease.STATUSES.PROPOSE }),
          domainBuilder.buildChallengeForRelease({ id: 'archiveChal0', status: ChallengeForRelease.STATUSES.ARCHIVE }),
        ],
      });

      // when
      const operativeChallenges = release.operativeChallenges;

      // then
      expect(operativeChallenges).toHaveLength(2);
      expect(operativeChallenges.map((c) => c.id)).toContain('valideChal0');
      expect(operativeChallenges.map((c) => c.id)).toContain('archiveChal0');
    });
    it('should return an empty array if no operative challenges', () => {
      // given
      const release = domainBuilder.buildDomainRelease.withContent({
        challengesFromRelease: [
          domainBuilder.buildChallengeForRelease({ id: 'perimeChal0', status: ChallengeForRelease.STATUSES.PERIME }),
          domainBuilder.buildChallengeForRelease({ id: 'proposeChal0', status: ChallengeForRelease.STATUSES.PROPOSE }),
        ],
      });

      // when
      const operativeChallenges = release.operativeChallenges;

      // then
      expect(operativeChallenges).toStrictEqual([]);
    });
  });
});
