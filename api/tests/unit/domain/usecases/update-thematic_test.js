import { beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { updateThematic } from '../../../../lib/domain/usecases/index.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';

describe('Unit | Domain | Use Cases | update-thematic', () => {

  const pixApiClient = Symbol('pixApiClient');
  const updatedThematic = Symbol('updatedThematic');
  const transformedThematic = Symbol('transformedThematic');
  const thematicUpdates = Symbol('thematicUpdates');

  let thematicRepository, thematic, updateStub, thematicTransformer, updatedRecordNotifier;

  beforeEach(() => {
    thematicRepository = {
      getByAirtableId: vi.fn(),
      update: vi.fn(),
    };
    thematicTransformer = {
      filterThematicFields: vi.fn(),
    };
    updatedRecordNotifier = {
      notify: vi.fn(),
    };

    thematic = domainBuilder.buildThematic();
    updateStub = vi.spyOn(thematic, 'update').mockReturnValueOnce();

    thematicRepository.getByAirtableId.mockResolvedValueOnce(thematic);

    thematicRepository.update.mockResolvedValueOnce(updatedThematic);

    thematicTransformer.filterThematicFields.mockReturnValueOnce(transformedThematic);
  });

  it('updates thematic and saves it', async () => {
    // given
    updatedRecordNotifier.notify.mockResolvedValueOnce();

    // when
    const result = updateThematic('recCompetence1', thematicUpdates, {
      thematicRepository,
      thematicTransformer,
      updatedRecordNotifier,
      pixApiClient,
    });

    // then
    await expect(result).resolves.toBe(updatedThematic);

    expect(thematicRepository.getByAirtableId).toHaveBeenCalledWith('recCompetence1');
    expect(updateStub).toHaveBeenCalledWith(thematicUpdates);
    expect(thematicRepository.update).toHaveBeenCalledWith(thematic);
    expect(thematicTransformer.filterThematicFields).toHaveBeenCalledWith(updatedThematic);
    expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({ updatedRecord: transformedThematic , model: 'thematics', pixApiClient });
  });

  describe('when thematic is not found', () => {
    it('throws a NotFoundError', async () => {
      // given
      thematicRepository.getByAirtableId.mockReset().mockResolvedValueOnce(null);

      // when
      const result = updateThematic('recCompetence1', thematicUpdates, {
        thematicRepository,
      });

      // then
      await expect(result).rejects.toStrictEqual(new NotFoundError('unknown thematic id'));
      expect(thematicRepository.getByAirtableId).toHaveBeenCalledWith('recCompetence1');
    });
  });

  describe('when record update notify fails', () => {
    it('does not fail', async () => {
      // given
      updatedRecordNotifier.notify.mockRejectedValueOnce(new Error());

      // when
      const result = updateThematic('recCompetence1', thematicUpdates, {
        thematicRepository,
        thematicTransformer,
        updatedRecordNotifier,
        pixApiClient,
      });

      // then
      await expect(result).resolves.toBe(updatedThematic);

      expect(thematicRepository.getByAirtableId).toHaveBeenCalledWith('recCompetence1');
      expect(updateStub).toHaveBeenCalledWith(thematicUpdates);
      expect(thematicRepository.update).toHaveBeenCalledWith(thematic);
      expect(thematicTransformer.filterThematicFields).toHaveBeenCalledWith(updatedThematic);
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({ updatedRecord: transformedThematic , model: 'thematics', pixApiClient });
    });
  });
});
