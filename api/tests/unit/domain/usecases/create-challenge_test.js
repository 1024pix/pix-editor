import { describe, it, vi, expect } from 'vitest';
import { createChallenge } from '../../../../lib/domain/usecases/create-challenge.js';

describe('Unit | Domain | Usecases | create challenge', function() {
  it('should create a challenge', async () => {
    // given
    const challengeToCreate = Symbol('challengeToCreate');
    const createdChallenge = Symbol('createdChallenge');
    const challengeRepositoryStub = {
      create: vi.fn().mockResolvedValueOnce(createdChallenge)
    };
    // when
    const result = await createChallenge(challengeToCreate, {
      challengeRepository: challengeRepositoryStub
    });

    // then
    expect(result).toBe(createdChallenge);
    expect(challengeRepositoryStub.create).toHaveBeenCalledOnce();
    expect(challengeRepositoryStub.create).toHaveBeenCalledWith(challengeToCreate);
  });
});
