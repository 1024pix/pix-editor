import { beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { updateTube } from '../../../../lib/domain/usecases/index.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';

describe('Unit | Domain | Use Cases | update-tube', () => {

  const updatedTube = Symbol('updatedTube');
  const tubeUpdates = Symbol('tubeUpdates');

  let tubeRepository, tube, updateStub, updatePixApiReleaseCache;

  beforeEach(() => {
    tubeRepository = {
      getByAirtableId: vi.fn(),
      update: vi.fn(),
    };
    updatePixApiReleaseCache = {
      onTubeUpdated: vi.fn().mockResolvedValueOnce(),
    };

    tube = domainBuilder.buildTube();
    updateStub = vi.spyOn(tube, 'update').mockReturnValueOnce();

    tubeRepository.getByAirtableId.mockResolvedValueOnce(tube);

    tubeRepository.update.mockResolvedValueOnce(updatedTube);
  });

  it('updates thematic and saves it', async () => {
    // when
    const result = updateTube('recTube1', tubeUpdates, {
      tubeRepository,
      updatePixApiReleaseCache,
    });

    // then
    await expect(result).resolves.toBe(updatedTube);

    expect(tubeRepository.getByAirtableId).toHaveBeenCalledWith('recTube1');
    expect(updateStub).toHaveBeenCalledWith(tubeUpdates);
    expect(tubeRepository.update).toHaveBeenCalledWith(tube);
    expect(updatePixApiReleaseCache.onTubeUpdated).toHaveBeenCalledWith(updatedTube);
  });

  describe('when thematic is not found', () => {
    it('throws a NotFoundError', async () => {
      // given
      tubeRepository.getByAirtableId.mockReset().mockResolvedValueOnce(null);

      // when
      const result = updateTube('recTube1', tubeUpdates, {
        tubeRepository,
      });

      // then
      await expect(result).rejects.toStrictEqual(new NotFoundError('unknown tube id'));
      expect(tubeRepository.getByAirtableId).toHaveBeenCalledWith('recTube1');
    });
  });
});
