import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createThematic } from '../../../../lib/domain/usecases/index.js';
import * as updatePixApiReleaseCache from '../../../../lib/domain/services/update-pix-api-release-cache.js';
import { Thematic } from '../../../../lib/domain/models/index.js';

describe('Unit | Domain | Use Cases | create-thematic', () => {
  const competenceThematics = Symbol('competenceThematics');
  const createdThematic = Symbol('createdThematic');
  let thematicRepository, thematic, prepareForCreationStub;

  beforeEach(() => {
    vi.spyOn(updatePixApiReleaseCache, 'onThematicCreated');
    thematicRepository = {
      create: vi.fn(),
      listByCompetenceAirtableId: vi.fn(),
    };

    thematicRepository.listByCompetenceAirtableId.mockResolvedValueOnce(competenceThematics);

    thematic = new Thematic({ competenceAirtableId: 'recCompetence1' });
    prepareForCreationStub = vi.spyOn(thematic, 'prepareForCreation');

    thematicRepository.create.mockResolvedValueOnce(createdThematic);
  });

  it('prepares thematic for creation and saves it', async () => {
    // given
    updatePixApiReleaseCache.onThematicCreated.mockResolvedValueOnce();

    // when
    const result = createThematic(thematic, { thematicRepository });

    // then
    await expect(result).resolves.toBe(createdThematic);

    expect(thematicRepository.listByCompetenceAirtableId).toHaveBeenCalledWith('recCompetence1');
    expect(prepareForCreationStub).toHaveBeenCalledWith(competenceThematics);
    expect(thematicRepository.create).toHaveBeenCalledWith(thematic);
    expect(updatePixApiReleaseCache.onThematicCreated).toHaveBeenCalledWith(createdThematic);
  });
});
