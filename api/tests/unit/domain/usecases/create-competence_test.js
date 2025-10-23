import { beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';

import { createCompetence } from '../../../../lib/domain/usecases/index.js';
import {
  areaRepository,
  competenceRepository,
  skillRepository,
  thematicRepository,
  tubeRepository,
} from '../../../../lib/infrastructure/repositories/index.js';
import { BadRequestError } from '../../../../lib/infrastructure/errors.js';
import * as updatedRecordNotifier from '../../../../lib/infrastructure/event-notifier/updated-record-notifier.js';
import { skillTransformer, tubeTransformer } from '../../../../lib/infrastructure/transformers/index.js';
import * as pixApiClient from '../../../../lib/infrastructure/pix-api-client.js';
import { Skill, Thematic, Tube } from '../../../../lib/domain/models/index.js';
import * as idGenerator from '../../../../lib/infrastructure/utils/id-generator.js';
import * as updatePixApiReleaseCache from '../../../../lib/domain/services/update-pix-api-release-cache.js';

describe('Unit | Domain | Usecases | create competence', function () {
  const transformedTube = Symbol('transformedTube');
  const skillForRelease = Symbol('skillForRelease');

  beforeEach(() => {
    vi.spyOn(areaRepository, 'getByAirtableId');
    vi.spyOn(competenceRepository, 'create');
    vi.spyOn(thematicRepository, 'create');
    vi.spyOn(tubeRepository, 'create');
    vi.spyOn(skillRepository, 'create');
    vi.spyOn(tubeTransformer, 'transformTube');
    vi.spyOn(skillTransformer, 'forRelease');
    vi.spyOn(updatedRecordNotifier, 'notify');
    vi.spyOn(idGenerator, 'generateNewId');
    vi.spyOn(updatePixApiReleaseCache, 'onCompetenceCreated');
    vi.spyOn(updatePixApiReleaseCache, 'onThematicCreated');
  });

  describe('when area id is unknown', () => {
    it('should throw a BadRequestError', async () => {
      // given
      const areaAirtableId = 'unknown area id';

      areaRepository.getByAirtableId.mockResolvedValueOnce(undefined);

      const competence = domainBuilder.buildCompetence({
        areaAirtableId,
      });

      // when
      const result = createCompetence(competence);

      // then
      await expect(result).rejects.toBeInstanceOf(BadRequestError);
      await expect(result).rejects.toHaveProperty('message', 'unknown area');

      expect(areaRepository.getByAirtableId).toHaveBeenCalledWith(areaAirtableId);
    });
  });

  describe('when area has some competences', () => {
    it('should compute new competence index accordingly', async () => {
      // given
      const areaAirtableId = 'areaAirtableId';

      areaRepository.getByAirtableId.mockResolvedValueOnce(
        domainBuilder.buildArea({
          code: '24',
          competenceIds: ['competence1', 'competence2', 'competence3', 'competence4', 'competence5'],
        }),
      );
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
      tubeTransformer.transformTube.mockReturnValueOnce(transformedTube);
      skillTransformer.forRelease.mockReturnValueOnce(skillForRelease);
      updatedRecordNotifier.notify.mockResolvedValue();
      updatePixApiReleaseCache.onCompetenceCreated.mockResolvedValue();
      updatePixApiReleaseCache.onThematicCreated.mockResolvedValue();
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
      expect(competenceRepository.create).toHaveBeenCalledWith(competence);
      expect(thematicRepository.create).toHaveBeenCalledWith(
        new Thematic({
          name_i18n: { fr: 'workbench_24_6' },
          index: 0,
          competenceAirtableId: createdCompetence.airtableId,
        }),
      );
      expect(tubeRepository.create).toHaveBeenCalledWith(
        new Tube({
          name: '@workbench',
          competenceAirtableId: createdCompetence.airtableId,
          thematicAirtableId: createdThematic.airtableId,
          practicalTitle_i18n: {
            fr: "Tube pour l'atelier de la compétence 24.6 Fmk",
          },
          practicalDescription_i18n: {},
        }),
      );
      expect(skillRepository.create).toHaveBeenCalledWith(
        new Skill({
          id: 'skill1',
          name: '@workbench',
          description: "Acquis pour l'atelier de la compétence 24.6 Fmk",
          tubeAirtableId: createdTube.airtableId,
          hint_i18n: {},
        }),
      );
      expect(tubeTransformer.transformTube).toHaveBeenCalledWith(createdTube);
      expect(skillTransformer.forRelease).toHaveBeenCalledWith(createdSkill);
      expect(updatePixApiReleaseCache.onCompetenceCreated).toHaveBeenCalledWith(createdCompetence);
      updatePixApiReleaseCache.onThematicCreated.mockResolvedValue(createdThematic);
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
        model: 'tubes',
        pixApiClient,
        updatedRecord: transformedTube,
      });
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
        model: 'skills',
        pixApiClient,
        updatedRecord: skillForRelease,
      });
      expect(idGenerator.generateNewId).toHaveBeenCalledWith('skill');
    });
  });

  describe('when area has no competences', () => {
    it('should compute new competence index accordingly', async () => {
      // given
      const areaAirtableId = 'areaAirtableId';

      areaRepository.getByAirtableId.mockResolvedValueOnce(
        domainBuilder.buildArea({
          code: '24',
          competenceIds: [],
        }),
      );
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
      tubeTransformer.transformTube.mockReturnValueOnce(transformedTube);
      skillTransformer.forRelease.mockReturnValueOnce(skillForRelease);
      updatedRecordNotifier.notify.mockResolvedValue();
      updatePixApiReleaseCache.onCompetenceCreated.mockResolvedValue();
      updatePixApiReleaseCache.onThematicCreated.mockResolvedValue();
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
      expect(competenceRepository.create).toHaveBeenCalledWith(competence);
      expect(thematicRepository.create).toHaveBeenCalledWith(
        new Thematic({
          name_i18n: { fr: 'workbench_24_1' },
          index: 0,
          competenceAirtableId: createdCompetence.airtableId,
        }),
      );
      expect(tubeRepository.create).toHaveBeenCalledWith(
        new Tube({
          name: '@workbench',
          competenceAirtableId: createdCompetence.airtableId,
          thematicAirtableId: createdThematic.airtableId,
          practicalTitle_i18n: {
            fr: "Tube pour l'atelier de la compétence 24.1 Fmk",
          },
          practicalDescription_i18n: {},
        }),
      );
      expect(skillRepository.create).toHaveBeenCalledWith(
        new Skill({
          id: 'skill1',
          name: '@workbench',
          description: "Acquis pour l'atelier de la compétence 24.1 Fmk",
          tubeAirtableId: createdTube.airtableId,
          hint_i18n: {},
        }),
      );
      expect(tubeTransformer.transformTube).toHaveBeenCalledWith(createdTube);
      expect(skillTransformer.forRelease).toHaveBeenCalledWith(createdSkill);
      expect(updatePixApiReleaseCache.onCompetenceCreated).toHaveBeenCalledWith(createdCompetence);
      expect(updatePixApiReleaseCache.onThematicCreated).toHaveBeenCalledWith(createdThematic);
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
        model: 'tubes',
        pixApiClient,
        updatedRecord: transformedTube,
      });
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
        model: 'skills',
        pixApiClient,
        updatedRecord: skillForRelease,
      });
      expect(idGenerator.generateNewId).toHaveBeenCalledWith('skill');
    });
  });

  describe('when record notifier fails', () => {
    it('should resolve anyway', async () => {
      // given
      const areaAirtableId = 'areaAirtableId';

      areaRepository.getByAirtableId.mockResolvedValueOnce(
        domainBuilder.buildArea({
          code: '24',
          competenceIds: [],
        }),
      );
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
      tubeTransformer.transformTube.mockReturnValueOnce(transformedTube);
      skillTransformer.forRelease.mockReturnValueOnce(skillForRelease);
      updatedRecordNotifier.notify.mockRejectedValue(new Error());
      updatePixApiReleaseCache.onCompetenceCreated.mockResolvedValue();
      updatePixApiReleaseCache.onThematicCreated.mockResolvedValue();
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
      expect(competenceRepository.create).toHaveBeenCalledWith(competence);
      expect(thematicRepository.create).toHaveBeenCalledWith(
        new Thematic({
          name_i18n: { fr: 'workbench_24_1' },
          index: 0,
          competenceAirtableId: createdCompetence.airtableId,
        }),
      );
      expect(tubeRepository.create).toHaveBeenCalledWith(
        new Tube({
          name: '@workbench',
          competenceAirtableId: createdCompetence.airtableId,
          thematicAirtableId: createdThematic.airtableId,
          practicalTitle_i18n: {
            fr: "Tube pour l'atelier de la compétence 24.1 Fmk",
          },
          practicalDescription_i18n: {},
        }),
      );
      expect(skillRepository.create).toHaveBeenCalledWith(
        new Skill({
          id: 'skill1',
          name: '@workbench',
          description: "Acquis pour l'atelier de la compétence 24.1 Fmk",
          tubeAirtableId: createdTube.airtableId,
          hint_i18n: {},
        }),
      );
      expect(skillTransformer.forRelease).toHaveBeenCalledWith(createdSkill);
      expect(updatePixApiReleaseCache.onCompetenceCreated).toHaveBeenCalledWith(createdCompetence);
      expect(updatePixApiReleaseCache.onThematicCreated).toHaveBeenCalledWith(createdThematic);
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
        model: 'tubes',
        pixApiClient,
        updatedRecord: transformedTube,
      });
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
        model: 'skills',
        pixApiClient,
        updatedRecord: skillForRelease,
      });
      expect(idGenerator.generateNewId).toHaveBeenCalledWith('skill');
    });
  });
});
