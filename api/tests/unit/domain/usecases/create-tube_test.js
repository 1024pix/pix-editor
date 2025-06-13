import { beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { createTube } from '../../../../lib/domain/usecases/index.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';

describe('Unit | Domain | Use Cases | create-tube', () => {

  const createdTube = Symbol('createdTube');

  let tubeRepository, thematicRepository, thematic, tube, prepareForCreationStub, updatePixApiReleaseCache;

  beforeEach(() => {
    tubeRepository = {
      create: vi.fn(),
    };
    thematicRepository = {
      getByAirtableId: vi.fn(),
    };
    updatePixApiReleaseCache = {
      onTubeCreated: vi.fn().mockResolvedValueOnce(),
    };

    thematic = domainBuilder.buildThematic({
      id: 'thematic1',
    });

    thematicRepository.getByAirtableId.mockResolvedValueOnce(thematic);

    tube = domainBuilder.buildTube({
      thematicAirtableId: 'recThematic1',
    });
    prepareForCreationStub = vi.spyOn(tube, 'prepareForCreation');

    tubeRepository.create.mockResolvedValueOnce(createdTube);
  });

  it('prepares tube for creation and saves it', async () => {
    // when
    const result = createTube(tube, {
      thematicRepository,
      tubeRepository,
      updatePixApiReleaseCache,
    });

    // then
    await expect(result).resolves.toBe(createdTube);

    expect(thematicRepository.getByAirtableId).toHaveBeenCalledWith('recThematic1');
    expect(prepareForCreationStub).toHaveBeenCalledWith(thematic);
    expect(tubeRepository.create).toHaveBeenCalledWith(tube);
    expect(updatePixApiReleaseCache.onTubeCreated).toHaveBeenCalledWith(createdTube, thematic);
  });

  describe('when thematic id is not found', () => {
    it('throws a NotFoundError', async () => {
      // given
      thematicRepository.getByAirtableId.mockReset().mockResolvedValueOnce(null);

      // when
      const result = createTube(tube, {
        thematicRepository,
      });

      // then
      await expect(result).rejects.toStrictEqual(new NotFoundError('unknown thematic id'));
    });
  });
});
