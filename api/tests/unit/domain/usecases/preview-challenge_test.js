import { describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { previewChallenge } from '../../../../lib/domain/usecases/preview-challenge.js';
import * as config from '../../../../lib/config.js';

describe('Unit | Domain | Usecases | preview-challenge', function() {

  it('should return a preview url for challengeId and locale', async () => {
    // given
    vi.spyOn(config.pixApp, 'baseUrl', 'get').mockReturnValue('https://preview.url.fr');
    const locale = 'fr';
    const challengeId = 'challenge-id';
    const localizedChallengeId = 'localizedChallengeId';
    const localizedChallenge = {
      id: localizedChallengeId,
      challengeId,
      locale,
    };
    const localizedChallengeRepository = {
      getByChallengeIdAndLocale: vi.fn().mockResolvedValueOnce(localizedChallenge),
    };
    const challenge = domainBuilder.buildChallenge();
    const challengeRepository = {
      get: vi.fn().mockResolvedValueOnce(challenge),
    };
    const refreshCache = vi.fn().mockResolvedValueOnce();

    // when
    const url = await previewChallenge({ challengeId, locale }, { localizedChallengeRepository, challengeRepository, refreshCache });

    // then
    expect(url).to.equal(`https://preview.url.fr/challenges/${localizedChallengeId}/preview`);
    expect(localizedChallengeRepository.getByChallengeIdAndLocale).toHaveBeenCalledWith({ locale, challengeId });
    expect(challengeRepository.get).toHaveBeenCalledWith(challengeId);
    expect(refreshCache).toHaveBeenCalledWith({ challenge, localizedChallenge });
  });
});
