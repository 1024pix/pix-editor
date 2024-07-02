import {  describe, expect, it, } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { extractEmbedUrlFromChallenges } from '../../../../lib/domain/usecases/get-embed-list.js';

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
      id: 'challengeWithInstruction',
      status: 'proposé',
      instruction: 'Salut clique [ici](https://epreuves.pix.fr/challengesWithInstruction.html) et ça sera bien'
    });
    const challengesWithInstructionOneParam = domainBuilder.buildChallenge({
      id: 'challengeWithInstructionOneParam',
      status: 'proposé',
      instruction: 'Salut clique [ici](https://epreuves.pix.fr/challengesWithInstruction.html?lang=fr)heuuuu'
    });
    const challengesWithInstructionTwoParam = domainBuilder.buildChallenge({
      id: 'challengeWithInstructionTwoParam',
      status: 'proposé',
      instruction: 'Salut clique <a href="https://epreuves.pix.fr/challengesWithInstruction.html?mode=coucou&lang=fr">ici</a>.'
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
      challengesWithInstructionOneParam,
      challengesWithInstructionTwoParam,
    ];

    // when
    const result =  extractEmbedUrlFromChallenges(challenges);

    // then

    expect(result).toStrictEqual([
      ['challengeWithInstruction','https://epreuves.pix.fr/challengesWithInstruction.html','proposé'],
      ['challengeWithInstructionOneParam','https://epreuves.pix.fr/challengesWithInstruction.html?lang=fr','proposé'],
      ['challengeWithInstructionTwoParam','https://epreuves.pix.fr/challengesWithInstruction.html?mode=coucou&lang=fr','proposé'],
      ['challengeWithEmbedUrl','https://epreuves.pix.fr/challengeWithEmbedUrl.html?mode=coucou&lang=fr','validé'],
      ['challengeWithEmbedUrlDecli','https://epreuves.pix.fr/challengeWithEmbedUrl.html?mode=lilou&lang=en','archivé'],
      ['challengeWithEmbedUrlAstro','https://epreuves.pix.fr/fr/challengeWithEmbedUrlAstro/coucou.html','validé'],
      ['challengeWithEmbedUrlAstroDecli','https://epreuves.pix.fr/fr/challengeWithEmbedUrlAstro/lilou.html','périmé'],
    ]);
  });
});
