import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { SkillForRelease } from '../../../../lib/domain/models/release/index.js';
describe('Unit | Domain | SkillForRelease', () => {
  describe('#isActif', () => {
    it.each([
      [SkillForRelease.STATUSES.ACTIF, true],
      [SkillForRelease.STATUSES.ARCHIVE, false],
      [SkillForRelease.STATUSES.EN_CONSTRUCTION, false],
      [SkillForRelease.STATUSES.PERIME, false],
    ])('returns $1 when status is $0', (status, expectedIsActif) => {
      // given
      const skillForRelease = domainBuilder.buildSkillForRelease({ status });

      // when
      const result = skillForRelease.isActif;

      // then
      expect(result).toBe(expectedIsActif);
    });
  });
});
