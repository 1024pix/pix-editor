import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { filterSkillFields, filterSkillsFields } from '../../../../lib/infrastructure/transformers/skill-transformer.js';

describe('Unit | Infrastructure | skill-transformer', function() {

  describe('#filterSkillFields', () => {
    it('filters skill fields for release', () => {
      // given
      const skill = domainBuilder.buildSkill();

      // when
      const filteredSkill = filterSkillFields(skill);

      // then
      expect(filteredSkill).toEqual(domainBuilder.buildSkillForRelease(skill));
    });
  });

  describe('#filterSkillsFields', () => {
    it('filters skills fields for release', function() {
      // given
      const skill1 = domainBuilder.buildSkill({ id: 'skill1' });
      const skill2 = domainBuilder.buildSkill({ id: 'skill2' });

      // when
      const filteredSkills = filterSkillsFields([skill1, skill2]);

      // then
      expect(filteredSkills).toEqual([domainBuilder.buildSkillForRelease(skill1), domainBuilder.buildSkillForRelease(skill2)]);
    });
  });
});
