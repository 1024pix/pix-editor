import { describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { previewChallenge } from '../../../../lib/domain/usecases/index.js';
import * as config from '../../../../lib/config.js';

describe('Unit | Domain | Usecases | preview-challenge', function() {

  it('should return a preview url for challengeId and locale', async () => {
    // given
    vi.spyOn(config.pixApp, 'baseUrlOrg', 'get').mockReturnValue('https://preview.url.org');
    const locale = 'fr';
    const challengeId = 'challenge-id';
    const localizedChallengeId = 'localizedChallengeId';
    const localizedChallenge = domainBuilder.buildLocalizedChallenge({
      id: localizedChallengeId,
      challengeId,
      locale,
      geography: 'TJ',
    });

    const challenge = domainBuilder.buildChallenge({
      localizedChallenges: [localizedChallenge],
      geography: 'Tadjikistan',
    });
    const challengeRepository = {
      get: vi.fn().mockResolvedValueOnce(challenge),
    };
    const refreshCache = vi.fn().mockResolvedValueOnce();

    // when
    const url = await previewChallenge({ challengeId, locale }, { challengeRepository, refreshCache });

    // then
    expect(url).to.equal(`https://preview.url.org/challenges/${localizedChallengeId}/preview?lang=fr`);
    expect(challengeRepository.get).toHaveBeenCalledWith(challengeId);
    expect(refreshCache).toHaveBeenCalledWith({ challenge });
  });

  describe('when no locale is specified', () => {
    it('should redirect to a preview on given challengeId without updating cache', async () => {
      // given
      vi.spyOn(config.pixApp, 'baseUrlFr', 'get').mockReturnValue('https://preview.url.fr');
      const challengeId = 'challenge-id';

      // when
      const url = await previewChallenge({ challengeId }, {});

      // then
      expect(url).to.equal(`https://preview.url.fr/challenges/${challengeId}/preview`);
    });
  });
});
