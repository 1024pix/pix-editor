import { beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { updateTube } from '../../../../lib/domain/usecases/index.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';

describe('Unit | Domain | Use Cases | update-tube', () => {
  const updatedTube = Symbol('updatedTube');
  const tubeUpdates = Symbol('tubeUpdates');
  const thematicDestination = {
    thematicAirtableId: 'thematicAirtableId',
    competenceAirtableId: 'competenceAirtableId',
  };

  let tubeRepository, thematicRepository, tube, updateStub, updatePixApiReleaseCache;

  beforeEach(() => {
    tubeRepository = {
      get: vi.fn(),
      update: vi.fn(),
    };

    thematicRepository = { get: vi.fn().mockReturnValueOnce(thematicDestination) };

    updatePixApiReleaseCache = { onTubeUpdated: vi.fn().mockResolvedValueOnce() };

    tube = domainBuilder.buildTube();
    updateStub = vi.spyOn(tube, 'update').mockReturnValueOnce();

    tubeRepository.get.mockResolvedValueOnce(tube);

    tubeRepository.update.mockResolvedValueOnce(updatedTube);
  });

  it('updates tube and saves it', async () => {
    // when
    const result = updateTube('recTube1', tubeUpdates, {
      tubeRepository,
      thematicRepository,
      updatePixApiReleaseCache,
    });

    // then
    await expect(result).resolves.toBe(updatedTube);

    expect(tubeRepository.get).toHaveBeenCalledWith('recTube1');
    expect(updateStub).toHaveBeenCalledWith(tubeUpdates, thematicDestination);
    expect(tubeRepository.update).toHaveBeenCalledWith(tube);
    expect(updatePixApiReleaseCache.onTubeUpdated).toHaveBeenCalledWith(updatedTube);
  });

  describe('when tube is not found', () => {
    it('throws a NotFoundError', async () => {
      // given
      tubeRepository.get.mockReset().mockResolvedValueOnce(null);

      // when
      const result = updateTube('recTube1', tubeUpdates, { tubeRepository });

      // then
      await expect(result).rejects.toStrictEqual(new NotFoundError('unknown tube id'));
      expect(tubeRepository.get).toHaveBeenCalledWith('recTube1');
    });
  });
});
