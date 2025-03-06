import { beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { createSkill } from '../../../../lib/domain/usecases/create-skill';
import { NotFoundError } from '../../../../lib/domain/errors.js';

describe('Unit | Domain | Use Cases | create-skill', () => {

  const createdSkill = Symbol('createdSkill');
  const tubeSkills = Symbol('');

  let skillRepository, tubeRepository, skillTransformer, updatedRecordNotifier;
  const pixApiClient = Symbol('pixApiClient');
  const generateNewIdFnc = Symbol('generateNewIdFnc');

  beforeEach(() => {
    skillRepository = {
      create: vi.fn().mockResolvedValueOnce(createdSkill),
      listByTubeId: vi.fn().mockResolvedValueOnce(tubeSkills),
    };
    tubeRepository = {
      getByAirtableId: vi.fn(),
    };
    skillTransformer = {
      filterSkillsFields: vi.fn().mockReturnValueOnce(['skillTransformed'])
    };
    updatedRecordNotifier = {
      notify: vi.fn()
    };
  });

  it('should set skill computed fields and save skill', async () => {
    // given
    const tube = domainBuilder.buildTube({
      id: 'tube1',
    });
    tubeRepository.getByAirtableId.mockResolvedValueOnce(tube);

    const skill = domainBuilder.buildSkill();
    vi.spyOn(skill, 'prepareForCreation').mockReturnValueOnce();

    // when
    const result = await createSkill(skill, {
      skillRepository,
      tubeRepository,
      skillTransformer,
      updatedRecordNotifier,
      pixApiClient,
      generateNewIdFnc
    });

    // then
    expect(result).toBe(createdSkill);

    expect(tubeRepository.getByAirtableId).toHaveBeenCalledWith(skill.tubeAirtableId);
    expect(skillRepository.listByTubeId).toHaveBeenCalledWith('tube1');
    expect(skill.prepareForCreation).toHaveBeenCalledWith(tube, tubeSkills, generateNewIdFnc);
    expect(skillRepository.create).toHaveBeenCalledWith(skill);
    expect(skillTransformer.filterSkillsFields).toHaveBeenCalledWith([createdSkill]);
    expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({ updatedRecord: 'skillTransformed' , model: 'skills', pixApiClient });
  });

  describe('when tube is not found', () => {
    it('should throw a NotFoundError', async () => {
      // given
      tubeRepository.getByAirtableId.mockResolvedValueOnce(null);

      const skill = domainBuilder.buildSkill();

      // when
      const resultPromise = createSkill(skill, { skillRepository, tubeRepository });

      // then
      await expect(resultPromise).rejects.toStrictEqual(new NotFoundError('Tube introuvable'));
    });
  });
});
