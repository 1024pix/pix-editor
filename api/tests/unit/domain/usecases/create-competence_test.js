import { describe, it, vi, expect, beforeEach } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';

import { createCompetence } from '../../../../lib/domain/usecases/create-competence.js';
import { areaRepository, competenceRepository, thematicRepository } from '../../../../lib/infrastructure/repositories/index.js';
import { BadRequestError } from '../../../../lib/infrastructure/errors.js';
import * as updatedRecordNotifier from '../../../../lib/infrastructure/event-notifier/updated-record-notifier.js';
import { competenceTransformer, thematicTransformer } from '../../../../lib/infrastructure/transformers/index.js';
import * as pixApiClient from '../../../../lib/infrastructure/pix-api-client.js';
import { Thematic } from '../../../../lib/domain/models/Thematic.js';

describe('Unit | Domain | Usecases | create competence', function() {

  const transformedCompetence = Symbol('transformedCompetence');
  const transformedThematic = Symbol('transformedThematic');

  beforeEach(() => {
    vi.spyOn(areaRepository, 'getByAirtableId');
    vi.spyOn(competenceRepository, 'listByAreaAirtableId');
    vi.spyOn(competenceRepository, 'create');
    vi.spyOn(thematicRepository, 'create');
    vi.spyOn(competenceTransformer, 'filterCompetenceFields');
    vi.spyOn(thematicTransformer, 'filterThematicFields');
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
      const createdThematic = domainBuilder.buildThematic();
      const createdCompetence = domainBuilder.buildCompetence({
        areaAirtableId,
        thematicIds: [],
        thematicAirtableIds: [],
      });
      competenceRepository.create.mockResolvedValueOnce(createdCompetence);
      thematicRepository.create.mockResolvedValueOnce(createdThematic);
      thematicTransformer.filterThematicFields.mockReturnValueOnce(transformedThematic);
      competenceTransformer.filterCompetenceFields.mockReturnValueOnce(transformedCompetence);
      updatedRecordNotifier.notify.mockResolvedValue();

      const competence = domainBuilder.buildCompetence({
        id: null,
        airtableId: null,
        areaAirtableId,
        thematicIds: [],
        thematicAirtableIds: [],
      });

      // when
      const result = await createCompetence(competence);

      // then
      expect(competence.index).toBe('24.6');

      expect(result).toBe(createdCompetence);
      expect(result).toHaveProperty('thematicIds', [createdThematic.id]);
      expect(result).toHaveProperty('thematicAirtableIds', [createdThematic.airtableId]);

      expect(areaRepository.getByAirtableId).toHaveBeenCalledWith(areaAirtableId);
      expect(competenceRepository.listByAreaAirtableId).toHaveBeenCalledWith(areaAirtableId);
      expect(competenceRepository.create).toHaveBeenCalledWith(competence);
      expect(thematicRepository.create).toHaveBeenCalledWith(new Thematic({
        name_i18n: { fr: 'workbench_24_6' },
        index: 0,
        competenceAirtableId: createdCompetence.airtableId,
      }));
      expect(competenceTransformer.filterCompetenceFields).toHaveBeenCalledWith(createdCompetence);
      expect(thematicTransformer.filterThematicFields).toHaveBeenCalledWith(createdThematic);
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
        model: 'thematics',
        pixApiClient,
        updatedRecord: transformedThematic,
      });
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
      const createdCompetence = domainBuilder.buildCompetence({
        areaAirtableId,
      });
      competenceRepository.create.mockResolvedValueOnce(createdCompetence);
      const createdThematic = domainBuilder.buildThematic();
      thematicRepository.create.mockResolvedValueOnce(createdThematic);
      thematicTransformer.filterThematicFields.mockReturnValueOnce(transformedThematic);
      competenceTransformer.filterCompetenceFields.mockReturnValueOnce(transformedCompetence);
      updatedRecordNotifier.notify.mockResolvedValue();

      const competence = domainBuilder.buildCompetence({
        id: null,
        airtableId: null,
        areaAirtableId,
      });

      // when
      const result = await createCompetence(competence);

      // then
      expect(competence.index).toBe('24.1');

      expect(result).toBe(createdCompetence);
      expect(result).toHaveProperty('thematicIds', [createdThematic.id]);
      expect(result).toHaveProperty('thematicAirtableIds', [createdThematic.airtableId]);

      expect(areaRepository.getByAirtableId).toHaveBeenCalledWith(areaAirtableId);
      expect(competenceRepository.listByAreaAirtableId).toHaveBeenCalledWith(areaAirtableId);
      expect(competenceRepository.create).toHaveBeenCalledWith(competence);
      expect(thematicRepository.create).toHaveBeenCalledWith(new Thematic({
        name_i18n: { fr: 'workbench_24_1' },
        index: 0,
        competenceAirtableId: createdCompetence.airtableId,
      }));
      expect(competenceTransformer.filterCompetenceFields).toHaveBeenCalledWith(createdCompetence);
      expect(thematicTransformer.filterThematicFields).toHaveBeenCalledWith(createdThematic);
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
        model: 'thematics',
        pixApiClient,
        updatedRecord: transformedThematic,
      });
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
      const createdCompetence = domainBuilder.buildCompetence({
        areaAirtableId,
      });
      competenceRepository.create.mockResolvedValueOnce(createdCompetence);
      const createdThematic = domainBuilder.buildThematic();
      thematicRepository.create.mockResolvedValueOnce(createdThematic);
      thematicTransformer.filterThematicFields.mockReturnValueOnce(transformedThematic);
      competenceTransformer.filterCompetenceFields.mockReturnValueOnce(transformedCompetence);
      updatedRecordNotifier.notify.mockRejectedValue(new Error());

      const competence = domainBuilder.buildCompetence({
        id: null,
        airtableId: null,
        areaAirtableId,
      });

      // when
      const result = await createCompetence(competence);

      // then
      expect(competence.index).toBe('24.1');

      expect(result).toBe(createdCompetence);
      expect(result).toHaveProperty('thematicIds', [createdThematic.id]);
      expect(result).toHaveProperty('thematicAirtableIds', [createdThematic.airtableId]);

      expect(areaRepository.getByAirtableId).toHaveBeenCalledWith(areaAirtableId);
      expect(competenceRepository.listByAreaAirtableId).toHaveBeenCalledWith(areaAirtableId);
      expect(competenceRepository.create).toHaveBeenCalledWith(competence);
      expect(thematicRepository.create).toHaveBeenCalledWith(new Thematic({
        name_i18n: { fr: 'workbench_24_1' },
        index: 0,
        competenceAirtableId: createdCompetence.airtableId,
      }));
      expect(competenceTransformer.filterCompetenceFields).toHaveBeenCalledWith(createdCompetence);
      expect(thematicTransformer.filterThematicFields).toHaveBeenCalledWith(createdThematic);
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
        model: 'thematics',
        pixApiClient,
        updatedRecord: transformedThematic,
      });
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
        model: 'competences',
        pixApiClient,
        updatedRecord: transformedCompetence,
      });
    });
  });
});
