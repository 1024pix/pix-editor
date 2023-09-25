import { describe, expect, it, vi } from 'vitest';
import { createChallenge } from '../../../../lib/domain/usecases/create-challenge.js';

describe('Unit | Domain | Usecases | create-challenge', () => {
  describe('#createChallenge', () => {
    it('creates the challenge', async () => {
      const challenge = {
        instruction: 'Une consigne en français',
        locales: ['fr'],
      };
      const expectedCreatedChallenge = Symbol('createdChallenge');

      const translationRepository = { save: vi.fn() };
      const challengeRepository = { create: vi.fn(async () => expectedCreatedChallenge) };
      const createdChallenge = await createChallenge(challenge, { translationRepository, challengeRepository });

      expect(createdChallenge).to.deep.equal(expectedCreatedChallenge);
    });
  });
});
