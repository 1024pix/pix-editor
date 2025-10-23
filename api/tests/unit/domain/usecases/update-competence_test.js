import { beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';

import { updateCompetence } from '../../../../lib/domain/usecases/index.js';
import { competenceRepository } from '../../../../lib/infrastructure/repositories/index.js';
import { NotFoundError } from '../../../../lib/infrastructure/errors.js';
import * as updatePixApiReleaseCache from '../../../../lib/domain/services/update-pix-api-release-cache.js';

describe('Unit | Domain | Usecases | update competence', function () {
  const competenceUpdates = Symbol('competenceUpdates');
  const updatedCompetence = Symbol('updatedCompetence');

  beforeEach(() => {
    vi.spyOn(competenceRepository, 'getByAirtableId');
    vi.spyOn(competenceRepository, 'update');
    vi.spyOn(updatePixApiReleaseCache, 'onCompetenceUpdated');
  });

  describe('when competence id is unknown', () => {
    it('should throw a NotFoundError', async () => {
      // given
      const competenceAirtableId = 'unknown competence id';

      competenceRepository.getByAirtableId.mockResolvedValueOnce(undefined);

      // when
      const result = updateCompetence(competenceAirtableId, competenceUpdates);

      // then
      await expect(result).rejects.toBeInstanceOf(NotFoundError);
      await expect(result).rejects.toHaveProperty('message', 'unknown competence');

      expect(competenceRepository.getByAirtableId).toHaveBeenCalledWith(competenceAirtableId);
    });
  });

  it('should update competence', async () => {
    // given
    const competenceAirtableId = 'competenceAirtableId';
    const existingCompetence = {
      update: vi.fn(),
    };

    competenceRepository.getByAirtableId.mockResolvedValueOnce(existingCompetence);
    competenceRepository.update.mockResolvedValueOnce(updatedCompetence);
    updatePixApiReleaseCache.onCompetenceUpdated.mockResolvedValueOnce();

    const competenceUpdates = domainBuilder.buildCompetence();

    // when
    const result = await updateCompetence(competenceAirtableId, competenceUpdates);

    // then
    expect(result).toBe(updatedCompetence);

    expect(competenceRepository.getByAirtableId).toHaveBeenCalledWith(competenceAirtableId);
    expect(existingCompetence.update).toHaveBeenCalledWith(competenceUpdates);
    expect(competenceRepository.update).toHaveBeenCalledWith(existingCompetence);
    expect(updatePixApiReleaseCache.onCompetenceUpdated).toHaveBeenCalledWith(updatedCompetence);
  });
});
