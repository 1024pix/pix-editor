import { beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { createThematic } from '../../../../lib/domain/usecases/index.js';

describe('Unit | Domain | Use Cases | create-thematic', () => {

  const pixApiClient = Symbol('pixApiClient');
  const competenceThematics = Symbol('competenceThematics');
  const createdThematic = Symbol('createdThematic');
  const transformedThematic = Symbol('transformedThematic');

  let thematicRepository, thematic, prepareForCreationStub, thematicTransformer, updatedRecordNotifier;

  beforeEach(() => {
    thematicRepository = {
      create: vi.fn(),
      listByCompetenceAirtableId: vi.fn(),
    };
    thematicTransformer = {
      filterThematicFields: vi.fn(),
    };
    updatedRecordNotifier = {
      notify: vi.fn(),
    };

    thematicRepository.listByCompetenceAirtableId.mockResolvedValueOnce(competenceThematics);

    thematic = domainBuilder.buildThematic({
      competenceAirtableId: 'recCompetence1',
    });
    prepareForCreationStub = vi.spyOn(thematic, 'prepareForCreation');

    thematicRepository.create.mockResolvedValueOnce(createdThematic);

    thematicTransformer.filterThematicFields.mockReturnValueOnce(transformedThematic);
  });

  it('prepares thematic for creation and saves it', async () => {
    // given
    updatedRecordNotifier.notify.mockResolvedValueOnce();

    // when
    const result = createThematic(thematic, {
      thematicRepository,
      thematicTransformer,
      updatedRecordNotifier,
      pixApiClient,
    });

    // then
    await expect(result).resolves.toBe(createdThematic);

    expect(thematicRepository.listByCompetenceAirtableId).toHaveBeenCalledWith('recCompetence1');
    expect(prepareForCreationStub).toHaveBeenCalledWith(competenceThematics);
    expect(thematicRepository.create).toHaveBeenCalledWith(thematic);
    expect(thematicTransformer.filterThematicFields).toHaveBeenCalledWith(createdThematic);
    expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({ updatedRecord: transformedThematic , model: 'thematics', pixApiClient });
  });

  describe('when record update notify fails', () => {
    it('does not fail', async () => {
      // given
      updatedRecordNotifier.notify.mockRejectedValueOnce(new Error());

      // when
      const result = createThematic(thematic, {
        thematicRepository,
        thematicTransformer,
        updatedRecordNotifier,
        pixApiClient,
      });

      // then
      await expect(result).resolves.toBe(createdThematic);

      expect(thematicRepository.listByCompetenceAirtableId).toHaveBeenCalledWith('recCompetence1');
      expect(prepareForCreationStub).toHaveBeenCalledWith(competenceThematics);
      expect(thematicRepository.create).toHaveBeenCalledWith(thematic);
      expect(thematicTransformer.filterThematicFields).toHaveBeenCalledWith(createdThematic);
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({ updatedRecord: transformedThematic , model: 'thematics', pixApiClient });
    });
  });
});
