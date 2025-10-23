import { beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { updateThematic } from '../../../../lib/domain/usecases/index.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';
import * as updatePixApiReleaseCache from '../../../../lib/domain/services/update-pix-api-release-cache.js';

describe('Unit | Domain | Use Cases | update-thematic', () => {
  const updatedThematic = Symbol('updatedThematic');
  const thematicUpdates = Symbol('thematicUpdates');

  let thematicRepository, thematic, updateStub;

  beforeEach(() => {
    vi.spyOn(updatePixApiReleaseCache, 'onThematicUpdated');
    thematicRepository = {
      getByAirtableId: vi.fn(),
      update: vi.fn(),
    };

    thematic = domainBuilder.buildThematic();
    updateStub = vi.spyOn(thematic, 'update').mockReturnValueOnce();
    thematicRepository.getByAirtableId.mockResolvedValueOnce(thematic);
    thematicRepository.update.mockResolvedValueOnce(updatedThematic);
  });

  it('updates thematic and saves it', async () => {
    // given
    updatePixApiReleaseCache.onThematicUpdated.mockResolvedValueOnce();

    // when
    const result = updateThematic('recThematic1', thematicUpdates, {
      thematicRepository,
    });

    // then
    await expect(result).resolves.toBe(updatedThematic);

    expect(thematicRepository.getByAirtableId).toHaveBeenCalledWith('recThematic1');
    expect(updateStub).toHaveBeenCalledWith(thematicUpdates);
    expect(thematicRepository.update).toHaveBeenCalledWith(thematic);
    expect(updatePixApiReleaseCache.onThematicUpdated).toHaveBeenCalledWith(updatedThematic);
  });

  describe('when thematic is not found', () => {
    it('throws a NotFoundError', async () => {
      // given
      thematicRepository.getByAirtableId.mockReset().mockResolvedValueOnce(null);

      // when
      const result = updateThematic('recThematic1', thematicUpdates, {
        thematicRepository,
      });

      // then
      await expect(result).rejects.toStrictEqual(new NotFoundError('unknown thematic id'));
      expect(thematicRepository.getByAirtableId).toHaveBeenCalledWith('recThematic1');
    });
  });
});
