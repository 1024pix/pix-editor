import { describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { modifyLocalizedChallenge } from '../../../../lib/domain/usecases/index.js';
import { LocalizedChallenge } from '../../../../lib/domain/models/index.js';

describe('Unit | Domain | Usecases | modify localized challenge', () => {
  describe('#modify', () => {
    it('should call the update() method on the original localized Challenge', async () => {
      const originalLocalizedChallenge = domainBuilder.buildLocalizedChallenge({});
      const updateSpy = vi.spyOn(originalLocalizedChallenge, 'update');
      const localizedChallengeRepository = {
        update: vi.fn(),
        get: vi.fn().mockResolvedValue(originalLocalizedChallenge),
      };
      const localizedChallenge = domainBuilder.buildLocalizedChallenge({});

      await modifyLocalizedChallenge({ localizedChallenge }, { localizedChallengeRepository });

      expect(localizedChallengeRepository.update).toHaveBeenCalledWith({
        localizedChallenge: originalLocalizedChallenge,
        transaction: expect.anything(),
      });
      expect(updateSpy).to.toHaveBeenCalledWith(localizedChallenge);
    });
    describe('when user is admin', () => {
      it('should allow status modification', async () => {
        const originalLocalizedChallenge = domainBuilder.buildLocalizedChallenge({
          status: LocalizedChallenge.STATUSES.PLAY,
        });
        const localizedChallengeRepository = {
          update: vi.fn(),
          get: vi.fn().mockResolvedValue(originalLocalizedChallenge),
        };
        const localizedChallenge = domainBuilder.buildLocalizedChallenge({
          id: 'localized-challenge-id',
          challengeId: 'challenge-id',
          embedUrl: 'original-embed-url',
          status: LocalizedChallenge.STATUSES.PLAY,
          locale: 'nl',
        });

        await modifyLocalizedChallenge({ isAdmin: true, localizedChallenge }, { localizedChallengeRepository });

        expect(localizedChallengeRepository.update).toHaveBeenCalledWith({
          localizedChallenge: originalLocalizedChallenge,
          transaction: expect.anything(),
        });
      });
    });
    describe('when user is not admin', () => {
      it('should not allow status modification', async () => {
        const originalLocalizedChallenge = domainBuilder.buildLocalizedChallenge({
          status: LocalizedChallenge.STATUSES.PLAY,
        });
        const localizedChallengeRepository = {
          update: vi.fn(),
          get: vi.fn().mockResolvedValue(originalLocalizedChallenge),
        };
        const localizedChallenge = domainBuilder.buildLocalizedChallenge({
          id: 'localized-challenge-id',
          challengeId: 'challenge-id',
          embedUrl: 'original-embed-url',
          status: LocalizedChallenge.STATUSES.PAUSE,
          locale: 'nl',
        });

        await expect(
          modifyLocalizedChallenge(
            {
              isAdmin: false,
              localizedChallenge,
            },
            { localizedChallengeRepository },
          ),
        ).rejects.toThrow();
        expect(localizedChallengeRepository.update).not.toHaveBeenCalled();
      });

      it('should be able to modify when status is not modified', async () => {
        const originalLocalizedChallenge = domainBuilder.buildLocalizedChallenge({
          status: LocalizedChallenge.STATUSES.PLAY,
        });
        const localizedChallengeRepository = {
          update: vi.fn(),
          get: vi.fn().mockResolvedValue(originalLocalizedChallenge),
        };
        const localizedChallenge = domainBuilder.buildLocalizedChallenge({
          id: 'localized-challenge-id',
          challengeId: 'challenge-id',
          embedUrl: 'original-embed-url',
          status: LocalizedChallenge.STATUSES.PLAY,
          locale: 'nl',
        });

        await modifyLocalizedChallenge(
          {
            isAdmin: false,
            localizedChallenge,
          },
          { localizedChallengeRepository },
        );

        expect(localizedChallengeRepository.update).toHaveBeenCalledWith({
          localizedChallenge: originalLocalizedChallenge,
          transaction: expect.anything(),
        });
        expect(localizedChallengeRepository.get).toHaveBeenCalledWith({
          id: 'localized-challenge-id',
          transaction: expect.anything(),
        });
      });
    });
  });
});
