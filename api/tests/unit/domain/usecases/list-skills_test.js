import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listSkills } from '../../../../lib/domain/usecases/list-skills';

describe('Unit | Domain | Use Cases | list-skills', () => {
  const allSkills = Symbol('allSkills');
  const skillsByAirtableIds = Symbol('skillsByAirtableIds');
  const foundSKills = Symbol('foundSKills');
  const skillByPixId = Symbol('skillByPixId');
  let skillRepository;

  beforeEach(() => {
    skillRepository = {
      list: vi.fn().mockResolvedValueOnce(allSkills),
      getMany: vi.fn().mockResolvedValueOnce(skillsByAirtableIds),
      search: vi.fn().mockResolvedValueOnce(foundSKills),
      get: vi.fn().mockResolvedValueOnce(skillByPixId),
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
    it('should list filtered skills', async () => {
      // given
      const filter = { ids: ['skill1', 'skill2'] };

      // when
      const result = await listSkills({ filter }, { skillRepository });

      // then
      expect(result).toBe(skillsByAirtableIds);
      expect(skillRepository.getMany).toHaveBeenCalledWith(['skill1', 'skill2']);
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

  describe('when filter pixId', () => {
    it('should list filtered skills', async () => {
      // given
      const filter = { pixId: 'skill1' };

      // when
      const result = await listSkills({ filter }, { skillRepository });

      // then
      expect(result).toStrictEqual([skillByPixId]);
      expect(skillRepository.get).toHaveBeenCalledWith('skill1');
    });
  });
});
