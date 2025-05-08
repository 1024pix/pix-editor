import { describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../../test-helper.js';
import { usecases } from '../../../../../lib/domain/usecases/propal/index.js';
import { normalizeNonBreakingSpace } from '../../../../../lib/infrastructure/utils/normalize-non-breaking-space.js';

describe('Unit | Domain | Usecases | create challenge', function() {
  it('should create a challenge', async () => {
    // given
    const challengeToCreate = domainBuilder.buildChallenge();
    const createdChallenge = Symbol('createdChallenge');
    const challengeRepositoryStub = {
      create: vi.fn().mockResolvedValueOnce(createdChallenge)
    };
    // when
    const result = await usecases.createChallenge({
      challenge: challengeToCreate,
      challengeRepository: challengeRepositoryStub,
      normalizeNonBreakingSpace,
    });

    // then
    expect(result).toBe(createdChallenge);
    expect(challengeRepositoryStub.create).toHaveBeenCalledOnce();
    expect(challengeRepositoryStub.create).toHaveBeenCalledWith(challengeToCreate);
  });

  it.each([
    ['fr', { instruction: 'Ça va ?', proposals:'Oui !', alternativeInstruction: 'Et donc ; voilà' }],
    ['fr-fr', { instruction: 'Ça va ?', proposals:'Oui !', alternativeInstruction: 'Et donc ; voilà' }],
    ['other', { instruction: 'Ça va ?', proposals:'Oui !', alternativeInstruction: 'Et donc ; voilà' }],
  ])('should normalize breaking space when challenge is `fr` or `fr-fr`', async (locale, expected) => {
    const challenge = domainBuilder.buildChallenge({
      locales: [locale],
      instruction: 'Ça va ?',
      proposals: 'Oui !',
      alternativeInstruction: 'Et donc ; voilà'
    });
    const challengeRepositoryStub = {
      create: vi.fn().mockResolvedValueOnce(challenge)
    };

    const result = await usecases.createChallenge({
      challenge,
      challengeRepository: challengeRepositoryStub,
      normalizeNonBreakingSpace,
    });

    expect(challengeRepositoryStub.create).toHaveBeenCalledOnce();
    expect(result.instruction).toBe(expected.instruction);
    expect(result.proposals).toBe(expected.proposals);
    expect(result.alternativeInstruction).toBe(expected.alternativeInstruction);
  });
});
