import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listThematics } from '../../../../lib/domain/usecases/list-thematics';

describe('Unit | Domain | Use Cases | list-thematics', () => {

  const allThematics = Symbol('allThematics');
  const thematicsByAirtableIds = Symbol('thematicsByAirtableIds');
  let thematicRepository;

  beforeEach(() => {
    thematicRepository = {
      list: vi.fn().mockResolvedValueOnce(allThematics),
      getManyByAirtableIds: vi.fn().mockResolvedValueOnce(thematicsByAirtableIds),
    };
  });

  describe('when no filters', () => {
    it('lists all thematics', async () => {
      // given
      const filter = {};

      // when
      const result = await listThematics({ filter }, { thematicRepository });

      // then
      expect(result).toBe(allThematics);
      expect(thematicRepository.list).toHaveBeenCalledWith();
    });
  });

  describe('when filter ids', () => {
    it('lists filtered thematics', async () => {
      // given
      const filter = { ids: ['recThematic1', 'recThematic2'] };

      // when
      const result = await listThematics({ filter }, { thematicRepository });

      // then
      expect(result).toBe(thematicsByAirtableIds);
      expect(thematicRepository.getManyByAirtableIds).toHaveBeenCalledWith(['recThematic1', 'recThematic2']);
    });
  });
});
