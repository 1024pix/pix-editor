import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listTubes } from '../../../../lib/domain/usecases/list-tubes';

describe('Unit | Domain | Use Cases | list-tubes', () => {
  const allTubes = Symbol('allTubes');
  const tubesByAirtableIds = Symbol('tubesByAirtableIds');
  let tubeRepository;

  beforeEach(() => {
    tubeRepository = {
      list: vi.fn().mockResolvedValueOnce(allTubes),
      getMany: vi.fn().mockResolvedValueOnce(tubesByAirtableIds),
    };
  });

  describe('when no filters', () => {
    it('lists all tubes', async () => {
      // given
      const filter = {};

      // when
      const result = await listTubes({ filter }, { tubeRepository });

      // then
      expect(result).toBe(allTubes);
      expect(tubeRepository.list).toHaveBeenCalledWith();
    });
  });

  describe('when filter ids', () => {
    it('lists filtered tubes', async () => {
      // given
      const filter = { ids: ['recTube1', 'recTube2'] };

      // when
      const result = await listTubes({ filter }, { tubeRepository });

      // then
      expect(result).toBe(tubesByAirtableIds);
      expect(tubeRepository.getMany).toHaveBeenCalledWith(['recTube1', 'recTube2']);
    });
  });
});
