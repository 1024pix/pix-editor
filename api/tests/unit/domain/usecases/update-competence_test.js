import { describe, it, vi, expect, beforeEach } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';

import { updateCompetence } from '../../../../lib/domain/usecases/update-competence.js';
import { competenceRepository } from '../../../../lib/infrastructure/repositories/index.js';
import { NotFoundError } from '../../../../lib/infrastructure/errors.js';
import * as updatedRecordNotifier from '../../../../lib/infrastructure/event-notifier/updated-record-notifier.js';
import { competenceTransformer } from '../../../../lib/infrastructure/transformers/index.js';
import * as pixApiClient from '../../../../lib/infrastructure/pix-api-client.js';

describe('Unit | Domain | Usecases | update competence', function() {

  const competenceUpdates = Symbol('competenceUpdates');
  const updatedCompetence = Symbol('updatedCompetence');
  const transformedCompetence = Symbol('transformedCompetence');

  beforeEach(() => {
    vi.spyOn(competenceRepository, 'getByAirtableId');
    vi.spyOn(competenceRepository, 'update');
    vi.spyOn(competenceTransformer, 'filterCompetenceFields');
    vi.spyOn(updatedRecordNotifier, 'notify');
  });

  describe('when competence id is unknown', () => {
    it('should throw a NotFoundError', async() => {
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

  it('should update competence', async () =>{
    // given
    const competenceAirtableId = 'competenceAirtableId';
    const existingCompetence = {
      update: vi.fn(),
    };

    competenceRepository.getByAirtableId.mockResolvedValueOnce(existingCompetence);
    competenceRepository.update.mockResolvedValueOnce(updatedCompetence);
    competenceTransformer.filterCompetenceFields.mockReturnValueOnce(transformedCompetence);
    updatedRecordNotifier.notify.mockResolvedValueOnce();

    const competenceUpdates = domainBuilder.buildCompetence();

    // when
    const result = await updateCompetence(competenceAirtableId, competenceUpdates);

    // then
    expect(result).toBe(updatedCompetence);

    expect(competenceRepository.getByAirtableId).toHaveBeenCalledWith(competenceAirtableId);
    expect(existingCompetence.update).toHaveBeenCalledWith(competenceUpdates);
    expect(competenceRepository.update).toHaveBeenCalledWith(existingCompetence);
    expect(competenceTransformer.filterCompetenceFields).toHaveBeenCalledWith(updatedCompetence);
    expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
      model: 'competences',
      pixApiClient,
      updatedRecord: transformedCompetence,
    });
  });

  describe('when record notifier fails', () => {
    it('should resolve anyway', async () =>{
      // given
      const competenceAirtableId = 'competenceAirtableId';
      const existingCompetence = {
        update: vi.fn(),
      };

      competenceRepository.getByAirtableId.mockResolvedValueOnce(existingCompetence);
      competenceRepository.update.mockResolvedValueOnce(updatedCompetence);
      competenceTransformer.filterCompetenceFields.mockReturnValueOnce(transformedCompetence);
      updatedRecordNotifier.notify.mockRejectedValueOnce(new Error());

      const competenceUpdates = domainBuilder.buildCompetence();

      // when
      const result = await updateCompetence(competenceAirtableId, competenceUpdates);

      // then
      expect(result).toBe(updatedCompetence);

      expect(competenceRepository.getByAirtableId).toHaveBeenCalledWith(competenceAirtableId);
      expect(existingCompetence.update).toHaveBeenCalledWith(competenceUpdates);
      expect(competenceRepository.update).toHaveBeenCalledWith(existingCompetence);
      expect(competenceTransformer.filterCompetenceFields).toHaveBeenCalledWith(updatedCompetence);
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
        model: 'competences',
        pixApiClient,
        updatedRecord: transformedCompetence,
      });
    });
  });
});
