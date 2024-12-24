import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listSkills } from '../../../../lib/domain/usecases/list-skills';

describe('Unit | Domain | Use Cases | list-skills', () => {

  const allSkills = Symbol('allSkills');
  const skillsByAirtableIds = Symbol('skillsByAirtableIds');
  let skillRepository;

  beforeEach(() => {
    skillRepository = {
      list: vi.fn().mockResolvedValueOnce(allSkills),
      getManyByAirtableIds: vi.fn().mockResolvedValueOnce(skillsByAirtableIds),
    };
  });

  describe('when no filters', () => {
    it('should list all skills', async () => {
      // given
      const filter = {};

      // when
      const result = await listSkills({ filter }, { skillRepository });

      // then
      expect(result).toBe(allSkills);
      expect(skillRepository.list).toHaveBeenCalledWith();
    });
  });

  describe('when filter ids', () => {
    it('should list fitlered skills', async () => {
      // given
      const filter = { ids: ['skill1', 'skill2'] };

      // when
      const result = await listSkills({ filter }, { skillRepository });

      // then
      expect(result).toBe(skillsByAirtableIds);
      expect(skillRepository.getManyByAirtableIds).toHaveBeenCalledWith(['skill1', 'skill2']);
    });
  });
});
