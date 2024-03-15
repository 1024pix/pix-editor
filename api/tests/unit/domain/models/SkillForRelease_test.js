import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { SkillForRelease } from '../../../../lib/domain/models/release/index.js';
describe('Unit | Domain | SkillForRelease', () => {
  describe('#canExportForTranslation', () => {
    it('should return true when skill is active', () => {
      // given
      const skillForRelease  = domainBuilder.buildSkillForRelease({
        status: SkillForRelease.STATUSES.ACTIF,
      });

      // when
      const result = skillForRelease.canExportForTranslation();

      // then
      expect(result).to.be.true;
    });

    it.each(Object.keys(SkillForRelease.STATUSES).filter((status) => SkillForRelease.STATUSES[status] !== SkillForRelease.STATUSES.ACTIF)
    )('should return false when status key is %s', (status) => {
      // given
      const skillForRelease  = domainBuilder.buildSkillForRelease({
        status,
      });

      // when
      const result = skillForRelease.canExportForTranslation();

      // then
      expect(result).not.to.be.true;
    });
  });
});
