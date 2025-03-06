import { describe, it, vi, expect, beforeEach } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';

import { createCompetence } from '../../../../lib/domain/usecases/create-competence.js';
import { areaRepository, competenceRepository } from '../../../../lib/infrastructure/repositories/index.js';
import { BadRequestError } from '../../../../lib/infrastructure/errors.js';
import * as updatedRecordNotifier from '../../../../lib/infrastructure/event-notifier/updated-record-notifier.js';
import { competenceTransformer } from '../../../../lib/infrastructure/transformers/index.js';
import * as pixApiClient from '../../../../lib/infrastructure/pix-api-client.js';

describe('Unit | Domain | Usecases | create competence', function() {

  const createdCompetence = Symbol('createdCompetence');
  const transformedCompetence = Symbol('transformedCompetence');

  beforeEach(() => {
    vi.spyOn(areaRepository, 'getByAirtableId');
    vi.spyOn(competenceRepository, 'listByAreaAirtableId');
    vi.spyOn(competenceRepository, 'create');
    vi.spyOn(competenceTransformer, 'filterCompetenceFields');
    vi.spyOn(updatedRecordNotifier, 'notify');
  });

  describe('when area id is unknown', () => {
    it('should throw a BadRequestError', async() => {
      // given
      const areaAirtableId = 'unknown area id';

      areaRepository.getByAirtableId.mockResolvedValueOnce(undefined);
      competenceRepository.listByAreaAirtableId.mockResolvedValueOnce([]);

      const competence = domainBuilder.buildCompetence({
        areaAirtableId,
      });

      // when
      const result = createCompetence(competence);

      // then
      await expect(result).rejects.toBeInstanceOf(BadRequestError);
      await expect(result).rejects.toHaveProperty('message', 'unknown area');

      expect(areaRepository.getByAirtableId).toHaveBeenCalledWith(areaAirtableId);
      expect(competenceRepository.listByAreaAirtableId).toHaveBeenCalledWith(areaAirtableId);
    });
  });

  describe('when area has some competences', () => {
    it('should compute new competence index accordingly', async () =>{
      // given
      const areaAirtableId = 'areaAirtableId';

      areaRepository.getByAirtableId.mockResolvedValueOnce(domainBuilder.buildArea({
        code: '24'
      }));
      competenceRepository.listByAreaAirtableId.mockResolvedValueOnce([
        domainBuilder.buildCompetence(),
        domainBuilder.buildCompetence(),
        domainBuilder.buildCompetence(),
        domainBuilder.buildCompetence(),
        domainBuilder.buildCompetence(),
      ]);
      competenceRepository.create.mockResolvedValueOnce(createdCompetence);
      competenceTransformer.filterCompetenceFields.mockReturnValueOnce(transformedCompetence);
      updatedRecordNotifier.notify.mockResolvedValueOnce();

      const competence = domainBuilder.buildCompetence({
        areaAirtableId,
      });

      // when
      const result = await createCompetence(competence);

      // then
      expect(competence.index).toBe('24.6');

      expect(result).toBe(createdCompetence);

      expect(areaRepository.getByAirtableId).toHaveBeenCalledWith(areaAirtableId);
      expect(competenceRepository.listByAreaAirtableId).toHaveBeenCalledWith(areaAirtableId);
      expect(competenceRepository.create).toHaveBeenCalledWith(competence);
      expect(competenceTransformer.filterCompetenceFields).toHaveBeenCalledWith(createdCompetence);
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
        model: 'competences',
        pixApiClient,
        updatedRecord: transformedCompetence,
      });
    });
  });

  describe('when area has no competences', () => {
    it('should compute new competence index accordingly', async () =>{
      // given
      const areaAirtableId = 'areaAirtableId';

      areaRepository.getByAirtableId.mockResolvedValueOnce(domainBuilder.buildArea({
        code: '24'
      }));
      competenceRepository.listByAreaAirtableId.mockResolvedValueOnce([]);
      competenceRepository.create.mockResolvedValueOnce(createdCompetence);
      competenceTransformer.filterCompetenceFields.mockReturnValueOnce(transformedCompetence);
      updatedRecordNotifier.notify.mockResolvedValueOnce();

      const competence = domainBuilder.buildCompetence({
        areaAirtableId,
      });

      // when
      const result = await createCompetence(competence);

      // then
      expect(competence.index).toBe('24.1');

      expect(result).toBe(createdCompetence);

      expect(areaRepository.getByAirtableId).toHaveBeenCalledWith(areaAirtableId);
      expect(competenceRepository.listByAreaAirtableId).toHaveBeenCalledWith(areaAirtableId);
      expect(competenceRepository.create).toHaveBeenCalledWith(competence);
      expect(competenceTransformer.filterCompetenceFields).toHaveBeenCalledWith(createdCompetence);
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
        model: 'competences',
        pixApiClient,
        updatedRecord: transformedCompetence,
      });
    });
  });

  describe('when record notifier fails', () => {
    it('should resolve anyway', async () => {
      // given
      const areaAirtableId = 'areaAirtableId';

      areaRepository.getByAirtableId.mockResolvedValueOnce(domainBuilder.buildArea({
        code: '24'
      }));
      competenceRepository.listByAreaAirtableId.mockResolvedValueOnce([]);
      competenceRepository.create.mockResolvedValueOnce(createdCompetence);
      competenceTransformer.filterCompetenceFields.mockReturnValueOnce(transformedCompetence);
      updatedRecordNotifier.notify.mockRejectedValueOnce(new Error());

      const competence = domainBuilder.buildCompetence({
        areaAirtableId,
      });

      // when
      const result = await createCompetence(competence);

      // then
      expect(competence.index).toBe('24.1');

      expect(result).toBe(createdCompetence);

      expect(areaRepository.getByAirtableId).toHaveBeenCalledWith(areaAirtableId);
      expect(competenceRepository.listByAreaAirtableId).toHaveBeenCalledWith(areaAirtableId);
      expect(competenceRepository.create).toHaveBeenCalledWith(competence);
      expect(competenceTransformer.filterCompetenceFields).toHaveBeenCalledWith(createdCompetence);
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
        model: 'competences',
        pixApiClient,
        updatedRecord: transformedCompetence,
      });
    });
  });
});
