import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listSkills } from '../../../../lib/domain/usecases/list-skills';

describe('Unit | Domain | Use Cases | list-skills', () => {

  const allSkills = Symbol('allSkills');
  const skillsByAirtableIds = Symbol('skillsByAirtableIds');
  const foundSKills = Symbol('foundSKills');
  let skillRepository;

  beforeEach(() => {
    skillRepository = {
      list: vi.fn().mockResolvedValueOnce(allSkills),
      getManyByAirtableIds: vi.fn().mockResolvedValueOnce(skillsByAirtableIds),
      search: vi.fn().mockResolvedValueOnce(foundSKills),
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

  describe('when filter name', () => {
    it('should search corresponding skills', async () => {
      // given
      const name = Symbol('name');
      const page = Symbol('page');
      const sort = Symbol('sort');
      const params = {
        filter: { name },
        page,
        sort,
      };

      // when
      const result = await listSkills(params, { skillRepository });

      // then
      expect(result).toBe(foundSKills);
    });
  });
});
