import {  describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { getEmbedList } from '../../../../lib/domain/usecases/get-embed-list.js';

describe('Unit | Domain | Usecases | get-embed-list-from-challenge', function() {

  it('should extract embed url from challenges', async () => {
    // given
    const challengeWithEmbedUrl =  domainBuilder.buildChallenge({
      id: 'challengeWithEmbedUrl',
      status: 'validé',
      embedUrl: 'https://epreuves.pix.fr/challengeWithEmbedUrl.html?mode=coucou&lang=fr'
    });
    const challengeWithEmbedUrlDecli =  domainBuilder.buildChallenge({
      id: 'challengeWithEmbedUrlDecli',
      status: 'archivé',
      embedUrl: 'https://epreuves.pix.fr/challengeWithEmbedUrl.html?mode=lilou&lang=en'
    });
    const challengeWithEmbedUrlAstro =  domainBuilder.buildChallenge({
      id: 'challengeWithEmbedUrlAstro',
      status: 'validé',
      embedUrl: 'https://epreuves.pix.fr/fr/challengeWithEmbedUrlAstro/coucou.html'
    });
    const challengeWithEmbedUrlAstroDecli =  domainBuilder.buildChallenge({
      id: 'challengeWithEmbedUrlAstroDecli',
      status: 'périmé',
      embedUrl: 'https://epreuves.pix.fr/fr/challengeWithEmbedUrlAstro/lilou.html'
    });
    const challengesWithInstruction = domainBuilder.buildChallenge({
      id: 'challengesWithInstruction',
      status: 'proposé',
      instruction: 'Salut clique [ici](https://epreuves.pix.fr/challengesWithInstruction.html?mode=coucou&lang=fr)'
    });
    const otherChallenge = domainBuilder.buildChallenge({
      id: 'otherChallenge',
      status: 'validé',
    });
    const challenges = [
      challengeWithEmbedUrl,
      challengeWithEmbedUrlDecli,
      challengeWithEmbedUrlAstro,
      challengeWithEmbedUrlAstroDecli,
      challengesWithInstruction,
      otherChallenge,
    ];

    const stubChallengeRepository = vi.fn().mockResolvedValueOnce(challenges);
    const challengeRepository = {
      list: stubChallengeRepository
    };
    // when
    const result = await getEmbedList({ challengeRepository });

    // then

    expect(stubChallengeRepository).toHaveBeenCalled();
    expect(result).toStrictEqual({
      challengeWithEmbedUrl: {
        valide: ['challengeWithEmbedUrl'],
        archive: ['challengeWithEmbedUrlDecli'],
      },
      challengeWithEmbedUrlAstro: {
        valide: ['challengeWithEmbedUrlAstro'],
        perime: ['challengeWithEmbedUrlAstroDecli']
      },
      challengesWithInstruction: {
        propose: ['challengesWithInstruction']
      }
    });
  });
});
