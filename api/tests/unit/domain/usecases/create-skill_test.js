import { beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { createSkill } from '../../../../lib/domain/usecases/index.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';
import * as updatePixApiReleaseCache from '../../../../lib/domain/services/update-pix-api-release-cache.js';

describe('Unit | Domain | Use Cases | create-skill', () => {

  const createdSkill = Symbol('createdSkill');
  const tubeSkills = Symbol('');

  let skillRepository, tubeRepository;
  const generateNewIdFnc = Symbol('generateNewIdFnc');
  const normalizeNonBreakingSpaceFnc = Symbol('normalizeNonBreakingSpaceFnc');

  beforeEach(() => {
    skillRepository = {
      create: vi.fn().mockResolvedValueOnce(createdSkill),
      listByTubeId: vi.fn().mockResolvedValueOnce(tubeSkills),
    };
    tubeRepository = {
      getByAirtableId: vi.fn(),
    };
    vi.spyOn(updatePixApiReleaseCache, 'onSkillCreated');
    updatePixApiReleaseCache.onSkillCreated.mockResolvedValue();
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
      generateNewIdFnc,
      normalizeNonBreakingSpaceFnc,
    });

    // then
    expect(result).toBe(createdSkill);

    expect(tubeRepository.getByAirtableId).toHaveBeenCalledWith(skill.tubeAirtableId);
    expect(skillRepository.listByTubeId).toHaveBeenCalledWith('tube1');
    expect(skill.prepareForCreation).toHaveBeenCalledWith(tube, tubeSkills, generateNewIdFnc, normalizeNonBreakingSpaceFnc);
    expect(skillRepository.create).toHaveBeenCalledWith(skill);
    updatePixApiReleaseCache.onSkillCreated.mockResolvedValue(createdSkill);
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
