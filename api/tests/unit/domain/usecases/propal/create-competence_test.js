import { beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../../test-helper.js';
import { BadRequestError } from '../../../../../lib/infrastructure/errors.js';
import { usecases } from '../../../../../lib/domain/usecases/propal/index.js';

describe('Unit | Domain | Usecases | create competence', function() {
  const createdCompetence = Symbol('createdCompetence');
  const transformedCompetence = Symbol('transformedCompetence');
  const pixApiClient = Symbol('pixApiClient');
  let areaRepository, competenceRepository, competenceTransformer, updatedRecordNotifier, logger, Sentry;
  let dependencies;

  beforeEach(() => {
    areaRepository = {
      getByAirtableId: vi.fn(),
    };
    competenceRepository = {
      listByAreaAirtableId: vi.fn(),
      create: vi.fn(),
    };
    competenceTransformer = {
      filterCompetenceFields: vi.fn(),
    };
    updatedRecordNotifier = {
      notify: vi.fn(),
    };
    logger = {
      error: vi.fn(),
    };
    Sentry = {
      captureException: vi.fn(),
    };
    dependencies = {
      areaRepository,
      competenceRepository,
      competenceTransformer,
      updatedRecordNotifier,
      pixApiClient,
      logger,
      Sentry,
    };
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

      // when / then
      const promise = usecases.createCompetence({ competence, ...dependencies });
      await expect(promise).rejects.toBeInstanceOf(BadRequestError);
      await expect(promise).rejects.toHaveProperty('message', 'unknown area');

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
      const result = await usecases.createCompetence({ competence, ...dependencies });

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
      const result = await usecases.createCompetence({ competence, ...dependencies });

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
      const result = await usecases.createCompetence({ competence, ...dependencies });

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
