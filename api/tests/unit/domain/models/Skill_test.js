import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { Skill } from '../../../../lib/domain/models/index.js';

describe('Unit | Domain | Skill', () => {
  describe('#get isLive', () => {
    it('should return true when skill is active', () => {
      // given
      const skill  = domainBuilder.buildSkill({
        status: Skill.STATUSES.ACTIF,
      });

      // when
      const isLive = skill.isLive;

      // then
      expect(isLive).to.be.true;
    });

    it('should return true when skill is en construction', () => {
      // given
      const skill  = domainBuilder.buildSkill({
        status: Skill.STATUSES.EN_CONSTRUCTION,
      });

      // when
      const isLive = skill.isLive;

      // then
      expect(isLive).to.be.true;
    });

    it.each(Object.keys(Skill.STATUSES).filter((status) => [Skill.STATUSES.ACTIF, Skill.STATUSES.EN_CONSTRUCTION].includes(Skill.STATUSES[status]))
    )('should return false when status key is %s', (status) => {
      // given
      const skill  = domainBuilder.buildSkill({
        status,
      });

      // when
      const isLive = skill.isLive;

      // then
      expect(isLive).to.be.false;
    });
  });
});
