import { describe, expect, it, vi } from 'vitest';
import { updateChallenge } from '../../../../lib/domain/usecases/update-challenge.js';

describe('Unit | Domain | Usecases | update-challenge', () => {
  describe('#updateChallenge', () => {
    it('updates the challenge', async () => {
      const challenge = {
        id: 'recChallengeId',
        instruction: 'Une consigne en français',
        locales: ['fr'],
      };
      const expectedUpdatedChallenge = Symbol('updatedChallenge');

      const translationRepository = { save: vi.fn(), deleteByKeyPrefix: vi.fn() };
      const challengeRepository = { update: vi.fn(async () => expectedUpdatedChallenge) };
      const updatedChallenge = await updateChallenge(challenge, { translationRepository, challengeRepository });

      expect(updatedChallenge).to.deep.equal(expectedUpdatedChallenge);
      expect(translationRepository.deleteByKeyPrefix).toHaveBeenCalledWith('challenge.recChallengeId.');
    });
  });
});
