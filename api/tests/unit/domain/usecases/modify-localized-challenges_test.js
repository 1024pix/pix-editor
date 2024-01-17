import { expect, describe, vi, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { modifyLocalizedChallenge } from '../../../../lib/domain/usecases/index.js';

describe('Unit | Domain | Usecases | modify localized challenge', () => {
  describe('#modify', () => {
    it('should modify embed URL', async () => {
      const localizedChallengeRepository = {
        update: vi.fn(),
        get: vi.fn().mockResolvedValue(domainBuilder.buildLocalizedChallenge({
          status: 'validé',
        }))
      };
      const localizedChallenge = domainBuilder.buildLocalizedChallenge({
        id: 'localized-challenge-id',
        challengeId: 'challenge-id',
        embedUrl: 'original-embed-url',
        status: 'validé',
        locale: 'nl',
      });

      await modifyLocalizedChallenge({ localizedChallenge }, { localizedChallengeRepository });

      expect(localizedChallengeRepository.update).toHaveBeenCalledWith({
        localizedChallenge,
        transaction: expect.anything()
      });
    });
    describe('when user is admin', () => {
      it('should modify status', async () => {
        const localizedChallengeRepository = {
          update: vi.fn(),
          get: vi.fn().mockResolvedValue(domainBuilder.buildLocalizedChallenge({
            status: 'validé',
          }))
        };
        const localizedChallenge = domainBuilder.buildLocalizedChallenge({
          id: 'localized-challenge-id',
          challengeId: 'challenge-id',
          embedUrl: 'original-embed-url',
          status: 'validé',
          locale: 'nl',
        });

        await modifyLocalizedChallenge({ isAdmin: true, localizedChallenge }, { localizedChallengeRepository });

        expect(localizedChallengeRepository.update).toHaveBeenCalledWith({ localizedChallenge,  transaction: expect.anything() });
      });
    });
    describe('when user is not admin', () => {
      it('should not modify status', async () => {
        const localizedChallengeRepository = {
          update: vi.fn(),
          get: vi.fn().mockResolvedValue(domainBuilder.buildLocalizedChallenge({
            status: 'validé',
          })),
        };
        const localizedChallenge = domainBuilder.buildLocalizedChallenge({
          id: 'localized-challenge-id',
          challengeId: 'challenge-id',
          embedUrl: 'original-embed-url',
          status: 'proposé',
          locale: 'nl',
        });

        expect(modifyLocalizedChallenge({
          isAdmin: false,
          localizedChallenge
        }, { localizedChallengeRepository })).rejects.toThrow();
        expect(localizedChallengeRepository.update).not.toHaveBeenCalledWith({ localizedChallenge,  transaction: expect.anything() });
      });

      it('should be able to modify when status is not modified', async () => {
        const localizedChallengeRepository = {
          update: vi.fn(),
          get: vi.fn().mockResolvedValue(domainBuilder.buildLocalizedChallenge({
            status: 'validé',
          }))
        };
        const localizedChallenge = domainBuilder.buildLocalizedChallenge({
          id: 'localized-challenge-id',
          challengeId: 'challenge-id',
          embedUrl: 'original-embed-url',
          status: 'validé',
          locale: 'nl',
        });

        await modifyLocalizedChallenge({
          isAdmin: false,
          localizedChallenge
        }, { localizedChallengeRepository });

        expect(localizedChallengeRepository.update).toHaveBeenCalledWith({
          localizedChallenge,
          transaction: expect.anything()
        });
        expect(localizedChallengeRepository.get).toHaveBeenCalledWith({
          id: 'localized-challenge-id',
          transaction: expect.anything()
        });
      });
    });
  });
});
