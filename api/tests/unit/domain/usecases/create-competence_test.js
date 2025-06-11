import { describe, it, vi, expect, beforeEach } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';

import { createCompetence } from '../../../../lib/domain/usecases/create-competence.js';
import { areaRepository, competenceRepository, skillRepository, thematicRepository, tubeRepository } from '../../../../lib/infrastructure/repositories/index.js';
import { BadRequestError } from '../../../../lib/infrastructure/errors.js';
import * as updatedRecordNotifier from '../../../../lib/infrastructure/event-notifier/updated-record-notifier.js';
import { competenceTransformer, skillTransformer, thematicTransformer, tubeTransformer } from '../../../../lib/infrastructure/transformers/index.js';
import * as pixApiClient from '../../../../lib/infrastructure/pix-api-client.js';
import { Skill, Thematic, Tube } from '../../../../lib/domain/models/index.js';
import * as idGenerator from '../../../../lib/infrastructure/utils/id-generator.js';

describe('Unit | Domain | Usecases | create competence', function() {

  const transformedCompetence = Symbol('transformedCompetence');
  const transformedThematic = Symbol('transformedThematic');
  const transformedTube = Symbol('transformedTube');
  const transformedSkill = Symbol('transformedSkill');

  beforeEach(() => {
    vi.spyOn(areaRepository, 'getByAirtableId');
    vi.spyOn(competenceRepository, 'listByAreaAirtableId');
    vi.spyOn(competenceRepository, 'create');
    vi.spyOn(thematicRepository, 'create');
    vi.spyOn(tubeRepository, 'create');
    vi.spyOn(skillRepository, 'create');
    vi.spyOn(competenceTransformer, 'filterCompetenceFields');
    vi.spyOn(thematicTransformer, 'filterThematicFields');
    vi.spyOn(tubeTransformer, 'transformTube');
    vi.spyOn(skillTransformer, 'filterSkillFields');
    vi.spyOn(updatedRecordNotifier, 'notify');
    vi.spyOn(idGenerator, 'generateNewId');
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
        code: '24',
      }));
      competenceRepository.listByAreaAirtableId.mockResolvedValueOnce([
        domainBuilder.buildCompetence(),
        domainBuilder.buildCompetence(),
        domainBuilder.buildCompetence(),
        domainBuilder.buildCompetence(),
        domainBuilder.buildCompetence(),
      ]);
      const createdCompetence = domainBuilder.buildCompetence({
        areaAirtableId,
        thematicIds: [],
        thematicAirtableIds: [],
        tubeAirtableIds: [],
        origin: 'Fmk',
        index: '24.6',
      });
      const createdThematic = domainBuilder.buildThematic();
      const createdTube = domainBuilder.buildTube();
      const createdSkill = domainBuilder.buildSkill();
      competenceRepository.create.mockResolvedValueOnce(createdCompetence);
      thematicRepository.create.mockResolvedValueOnce(createdThematic);
      tubeRepository.create.mockResolvedValueOnce(createdTube);
      skillRepository.create.mockResolvedValueOnce(createdSkill);
      competenceTransformer.filterCompetenceFields.mockReturnValueOnce(transformedCompetence);
      thematicTransformer.filterThematicFields.mockReturnValueOnce(transformedThematic);
      tubeTransformer.transformTube.mockReturnValueOnce(transformedTube);
      skillTransformer.filterSkillFields.mockReturnValueOnce(transformedSkill);
      updatedRecordNotifier.notify.mockResolvedValue();
      idGenerator.generateNewId.mockReturnValueOnce('skill1');

      const competence = domainBuilder.buildCompetence({
        id: null,
        airtableId: null,
        areaAirtableId,
        thematicIds: [],
        thematicAirtableIds: [],
        tubeAirtableIds: [],
      });

      // when
      const result = await createCompetence(competence);

      // then
      expect(competence.index).toBe('24.6');

      expect(result).toBe(createdCompetence);
      expect(result).toHaveProperty('thematicIds', [createdThematic.id]);
      expect(result).toHaveProperty('thematicAirtableIds', [createdThematic.airtableId]);
      expect(result).toHaveProperty('tubeAirtableIds', [createdTube.airtableId]);

      expect(areaRepository.getByAirtableId).toHaveBeenCalledWith(areaAirtableId);
      expect(competenceRepository.listByAreaAirtableId).toHaveBeenCalledWith(areaAirtableId);
      expect(competenceRepository.create).toHaveBeenCalledWith(competence);
      expect(thematicRepository.create).toHaveBeenCalledWith(new Thematic({
        name_i18n: { fr: 'workbench_24_6' },
        index: 0,
        competenceAirtableId: createdCompetence.airtableId,
      }));
      expect(tubeRepository.create).toHaveBeenCalledWith(new Tube({
        name: '@workbench',
        competenceAirtableId: createdCompetence.airtableId,
        thematicAirtableId: createdThematic.airtableId,
        practicalTitle_i18n: {
          fr: 'Tube pour l\'atelier de la compétence 24.6 Fmk',
        },
        practicalDescription_i18n: {},
      }));
      expect(skillRepository.create).toHaveBeenCalledWith(new Skill({
        id: 'skill1',
        name: '@workbench',
        description: 'Acquis pour l\'atelier de la compétence 24.6 Fmk',
        tubeAirtableId: createdTube.airtableId,
        hint_i18n: {},
      }));
      expect(competenceTransformer.filterCompetenceFields).toHaveBeenCalledWith(createdCompetence);
      expect(thematicTransformer.filterThematicFields).toHaveBeenCalledWith(createdThematic);
      expect(tubeTransformer.transformTube).toHaveBeenCalledWith(createdTube, createdThematic.id);
      expect(skillTransformer.filterSkillFields).toHaveBeenCalledWith(createdSkill);
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
        model: 'competences',
        pixApiClient,
        updatedRecord: transformedCompetence,
      });
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
        model: 'thematics',
        pixApiClient,
        updatedRecord: transformedThematic,
      });
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
        model: 'tubes',
        pixApiClient,
        updatedRecord: transformedTube,
      });
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
        model: 'skills',
        pixApiClient,
        updatedRecord: transformedSkill,
      });
      expect(idGenerator.generateNewId).toHaveBeenCalledWith('skill');
    });
  });

  describe('when area has no competences', () => {
    it('should compute new competence index accordingly', async () =>{
      // given
      const areaAirtableId = 'areaAirtableId';

      areaRepository.getByAirtableId.mockResolvedValueOnce(domainBuilder.buildArea({
        code: '24',
      }));
      competenceRepository.listByAreaAirtableId.mockResolvedValueOnce([]);
      const createdCompetence = domainBuilder.buildCompetence({
        areaAirtableId,
        thematicIds: [],
        thematicAirtableIds: [],
        tubeAirtableIds: [],
        origin: 'Fmk',
        index: '24.1',
      });
      const createdThematic = domainBuilder.buildThematic();
      const createdTube = domainBuilder.buildTube();
      const createdSkill = domainBuilder.buildSkill();
      competenceRepository.create.mockResolvedValueOnce(createdCompetence);
      thematicRepository.create.mockResolvedValueOnce(createdThematic);
      tubeRepository.create.mockResolvedValueOnce(createdTube);
      skillRepository.create.mockResolvedValueOnce(createdSkill);
      competenceTransformer.filterCompetenceFields.mockReturnValueOnce(transformedCompetence);
      thematicTransformer.filterThematicFields.mockReturnValueOnce(transformedThematic);
      tubeTransformer.transformTube.mockReturnValueOnce(transformedTube);
      skillTransformer.filterSkillFields.mockReturnValueOnce(transformedSkill);
      updatedRecordNotifier.notify.mockResolvedValue();
      idGenerator.generateNewId.mockReturnValueOnce('skill1');

      const competence = domainBuilder.buildCompetence({
        id: null,
        airtableId: null,
        areaAirtableId,
        thematicIds: [],
        thematicAirtableIds: [],
        tubeAirtableIds: [],
      });

      // when
      const result = await createCompetence(competence);

      // then
      expect(competence.index).toBe('24.1');

      expect(result).toBe(createdCompetence);
      expect(result).toHaveProperty('thematicIds', [createdThematic.id]);
      expect(result).toHaveProperty('thematicAirtableIds', [createdThematic.airtableId]);
      expect(result).toHaveProperty('tubeAirtableIds', [createdTube.airtableId]);

      expect(areaRepository.getByAirtableId).toHaveBeenCalledWith(areaAirtableId);
      expect(competenceRepository.listByAreaAirtableId).toHaveBeenCalledWith(areaAirtableId);
      expect(competenceRepository.create).toHaveBeenCalledWith(competence);
      expect(thematicRepository.create).toHaveBeenCalledWith(new Thematic({
        name_i18n: { fr: 'workbench_24_1' },
        index: 0,
        competenceAirtableId: createdCompetence.airtableId,
      }));
      expect(tubeRepository.create).toHaveBeenCalledWith(new Tube({
        name: '@workbench',
        competenceAirtableId: createdCompetence.airtableId,
        thematicAirtableId: createdThematic.airtableId,
        practicalTitle_i18n: {
          fr: 'Tube pour l\'atelier de la compétence 24.1 Fmk',
        },
        practicalDescription_i18n: {},
      }));
      expect(skillRepository.create).toHaveBeenCalledWith(new Skill({
        id: 'skill1',
        name: '@workbench',
        description: 'Acquis pour l\'atelier de la compétence 24.1 Fmk',
        tubeAirtableId: createdTube.airtableId,
        hint_i18n: {},
      }));
      expect(competenceTransformer.filterCompetenceFields).toHaveBeenCalledWith(createdCompetence);
      expect(thematicTransformer.filterThematicFields).toHaveBeenCalledWith(createdThematic);
      expect(tubeTransformer.transformTube).toHaveBeenCalledWith(createdTube, createdThematic.id);
      expect(skillTransformer.filterSkillFields).toHaveBeenCalledWith(createdSkill);
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
        model: 'competences',
        pixApiClient,
        updatedRecord: transformedCompetence,
      });
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
        model: 'thematics',
        pixApiClient,
        updatedRecord: transformedThematic,
      });
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
        model: 'tubes',
        pixApiClient,
        updatedRecord: transformedTube,
      });
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
        model: 'skills',
        pixApiClient,
        updatedRecord: transformedSkill,
      });
      expect(idGenerator.generateNewId).toHaveBeenCalledWith('skill');
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
        thematicIds: [],
        thematicAirtableIds: [],
        tubeAirtableIds: [],
        origin: 'Fmk',
        index: '24.1',
      });
      const createdThematic = domainBuilder.buildThematic();
      const createdTube = domainBuilder.buildTube();
      const createdSkill = domainBuilder.buildSkill();
      competenceRepository.create.mockResolvedValueOnce(createdCompetence);
      thematicRepository.create.mockResolvedValueOnce(createdThematic);
      tubeRepository.create.mockResolvedValueOnce(createdTube);
      skillRepository.create.mockResolvedValueOnce(createdSkill);
      competenceTransformer.filterCompetenceFields.mockReturnValueOnce(transformedCompetence);
      thematicTransformer.filterThematicFields.mockReturnValueOnce(transformedThematic);
      tubeTransformer.transformTube.mockReturnValueOnce(transformedTube);
      skillTransformer.filterSkillFields.mockReturnValueOnce(transformedSkill);
      updatedRecordNotifier.notify.mockRejectedValue(new Error());
      idGenerator.generateNewId.mockReturnValueOnce('skill1');

      const competence = domainBuilder.buildCompetence({
        id: null,
        airtableId: null,
        areaAirtableId,
        thematicIds: [],
        thematicAirtableIds: [],
        tubeAirtableIds: [],
      });

      // when
      const result = await createCompetence(competence);

      // then
      expect(competence.index).toBe('24.1');

      expect(result).toBe(createdCompetence);
      expect(result).toHaveProperty('thematicIds', [createdThematic.id]);
      expect(result).toHaveProperty('thematicAirtableIds', [createdThematic.airtableId]);
      expect(result).toHaveProperty('tubeAirtableIds', [createdTube.airtableId]);

      expect(areaRepository.getByAirtableId).toHaveBeenCalledWith(areaAirtableId);
      expect(competenceRepository.listByAreaAirtableId).toHaveBeenCalledWith(areaAirtableId);
      expect(competenceRepository.create).toHaveBeenCalledWith(competence);
      expect(thematicRepository.create).toHaveBeenCalledWith(new Thematic({
        name_i18n: { fr: 'workbench_24_1' },
        index: 0,
        competenceAirtableId: createdCompetence.airtableId,
      }));
      expect(tubeRepository.create).toHaveBeenCalledWith(new Tube({
        name: '@workbench',
        competenceAirtableId: createdCompetence.airtableId,
        thematicAirtableId: createdThematic.airtableId,
        practicalTitle_i18n: {
          fr: 'Tube pour l\'atelier de la compétence 24.1 Fmk',
        },
        practicalDescription_i18n: {},
      }));
      expect(skillRepository.create).toHaveBeenCalledWith(new Skill({
        id: 'skill1',
        name: '@workbench',
        description: 'Acquis pour l\'atelier de la compétence 24.1 Fmk',
        tubeAirtableId: createdTube.airtableId,
        hint_i18n: {},
      }));
      expect(competenceTransformer.filterCompetenceFields).toHaveBeenCalledWith(createdCompetence);
      expect(thematicTransformer.filterThematicFields).toHaveBeenCalledWith(createdThematic);
      expect(tubeTransformer.transformTube).toHaveBeenCalledWith(createdTube, createdThematic.id);
      expect(skillTransformer.filterSkillFields).toHaveBeenCalledWith(createdSkill);
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
        model: 'competences',
        pixApiClient,
        updatedRecord: transformedCompetence,
      });
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
        model: 'thematics',
        pixApiClient,
        updatedRecord: transformedThematic,
      });
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
        model: 'tubes',
        pixApiClient,
        updatedRecord: transformedTube,
      });
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
        model: 'skills',
        pixApiClient,
        updatedRecord: transformedSkill,
      });
      expect(idGenerator.generateNewId).toHaveBeenCalledWith('skill');
    });
  });
});
