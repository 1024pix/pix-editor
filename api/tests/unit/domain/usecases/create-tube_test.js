import { beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { createTube } from '../../../../lib/domain/usecases/index.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';

describe('Unit | Domain | Use Cases | create-tube', () => {

  const pixApiClient = Symbol('pixApiClient');
  const createdTube = Symbol('createdTube');
  const transformedTube = Symbol('transformedTube');

  let tubeRepository, thematicRepository, thematic, tube, prepareForCreationStub, tubeTransformer, updatedRecordNotifier;

  beforeEach(() => {
    tubeRepository = {
      create: vi.fn(),
    };
    thematicRepository = {
      getByAirtableId: vi.fn(),
    };
    tubeTransformer = {
      transformTube: vi.fn(),
    };
    updatedRecordNotifier = {
      notify: vi.fn(),
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

    tubeTransformer.transformTube.mockReturnValueOnce(transformedTube);
  });

  it('prepares tube for creation and saves it', async () => {
    // given
    updatedRecordNotifier.notify.mockResolvedValueOnce();

    // when
    const result = createTube(tube, {
      thematicRepository,
      tubeRepository,
      tubeTransformer,
      updatedRecordNotifier,
      pixApiClient,
    });

    // then
    await expect(result).resolves.toBe(createdTube);

    expect(thematicRepository.getByAirtableId).toHaveBeenCalledWith('recThematic1');
    expect(prepareForCreationStub).toHaveBeenCalledWith(thematic);
    expect(tubeRepository.create).toHaveBeenCalledWith(tube);
    expect(tubeTransformer.transformTube).toHaveBeenCalledWith(createdTube, 'thematic1');
    expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({ updatedRecord: transformedTube , model: 'tubes', pixApiClient });
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

  describe('when record update notify fails', () => {
    it('does not fail', async () => {
      // given
      updatedRecordNotifier.notify.mockRejectedValueOnce(new Error());

      // when
      const result = createTube(tube, {
        thematicRepository,
        tubeRepository,
        tubeTransformer,
        updatedRecordNotifier,
        pixApiClient,
      });

      // then
      await expect(result).resolves.toBe(createdTube);

      expect(thematicRepository.getByAirtableId).toHaveBeenCalledWith('recThematic1');
      expect(prepareForCreationStub).toHaveBeenCalledWith(thematic);
      expect(tubeRepository.create).toHaveBeenCalledWith(tube);
      expect(tubeTransformer.transformTube).toHaveBeenCalledWith(createdTube, 'thematic1');
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({ updatedRecord: transformedTube , model: 'tubes', pixApiClient });
    });
  });
});
