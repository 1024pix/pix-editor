import { beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { createSkill } from '../../../../lib/domain/usecases/index.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';

describe('Unit | Domain | Use Cases | create-skill', () => {
  const createdSkill = Symbol('createdSkill');
  const tubeSkills = Symbol('');

  let skillRepository, tubeRepository, skillTransformer, updatedRecordNotifier;
  const pixApiClient = Symbol('pixApiClient');
  const generateNewIdFnc = Symbol('generateNewIdFnc');
  const normalizeNonBreakingSpaceFnc = Symbol('normalizeNonBreakingSpaceFnc');

  beforeEach(() => {
    skillRepository = {
      create: vi.fn().mockResolvedValueOnce(createdSkill),
      listByTubeId: vi.fn().mockResolvedValueOnce(tubeSkills),
    };
    tubeRepository = { get: vi.fn() };
    skillTransformer = { forRelease: vi.fn().mockReturnValueOnce('skillForRelease') };
    updatedRecordNotifier = { notify: vi.fn() };
  });

  it('should set skill computed fields and save skill', async () => {
    // given
    const tube = domainBuilder.buildTube({ id: 'tube1' });
    tubeRepository.get.mockResolvedValueOnce(tube);

    const skill = domainBuilder.buildSkill();
    vi.spyOn(skill, 'prepareForCreation').mockReturnValueOnce();

    // when
    const result = await createSkill(skill, {
      skillRepository,
      tubeRepository,
      skillTransformer,
      updatedRecordNotifier,
      pixApiClient,
      generateNewIdFnc,
      normalizeNonBreakingSpaceFnc,
    });

    // then
    expect(result).toBe(createdSkill);

    expect(tubeRepository.get).toHaveBeenCalledWith(skill.tubeAirtableId);
    expect(skillRepository.listByTubeId).toHaveBeenCalledWith('tube1');
    expect(skill.prepareForCreation).toHaveBeenCalledWith(
      tube,
      tubeSkills,
      generateNewIdFnc,
      normalizeNonBreakingSpaceFnc,
    );
    expect(skillRepository.create).toHaveBeenCalledWith(skill);
    expect(skillTransformer.forRelease).toHaveBeenCalledWith(createdSkill);
    expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
      updatedRecord: 'skillForRelease',
      model: 'skills',
      pixApiClient,
    });
  });

  describe('when tube is not found', () => {
    it('should throw a NotFoundError', async () => {
      // given
      tubeRepository.get.mockResolvedValueOnce(null);

      const skill = domainBuilder.buildSkill();

      // when
      const resultPromise = createSkill(skill, { skillRepository, tubeRepository });

      // then
      await expect(resultPromise).rejects.toStrictEqual(new NotFoundError('Tube introuvable'));
    });
  });
});
