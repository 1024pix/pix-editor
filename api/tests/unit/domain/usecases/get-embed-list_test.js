import { describe, expect, it, } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { findPixEpreuvesUrlsFromChallenges } from '../../../../lib/domain/usecases/get-embed-list.js';

describe('Unit | Domain | Usecases | get-embed-list-from-release', function() {

  it('should extract embed url from release', async () => {
    // given

    const competence = domainBuilder.buildCompetenceForRelease({
      id: 'competenceId',
      name_i18n: {
        fr: 'Ma competence',
        en: 'My comptence'
      },
      origin: 'pix',
    });

    const tube = domainBuilder.buildTubeForRelease({
      id: 'tubeId',
      name: '@sujet',
      competenceId: competence.id
    });

    const skill = domainBuilder.buildSkillForRelease({
      id: 'skillId',
      name: '@sujet1',
      tubeId: tube.id,
      competenceId: competence.id,
    });

    const challengeWithEmbedUrl =  domainBuilder.buildChallengeForRelease({
      id: 'challengeWithEmbedUrl',
      status: 'validé',
      skillId: skill.id,
      embedUrl: 'https://epreuves.pix.fr/challengeWithEmbedUrl.html?mode=coucou&lang=fr'
    });
    const challengeWithEmbedUrlDecli =  domainBuilder.buildChallengeForRelease({
      id: 'challengeWithEmbedUrlDecli',
      status: 'archivé',
      skillId: skill.id,
      embedUrl: 'https://epreuves.pix.fr/challengeWithEmbedUrl.html?mode=lilou&lang=en'
    });
    const challengeWithEmbedUrlAstro =  domainBuilder.buildChallengeForRelease({
      id: 'challengeWithEmbedUrlAstro',
      status: 'validé',
      skillId: skill.id,
      embedUrl: 'https://epreuves.pix.fr/fr/challengeWithEmbedUrlAstro/coucou.html'
    });
    const challengeWithEmbedUrlAstroDecli =  domainBuilder.buildChallengeForRelease({
      id: 'challengeWithEmbedUrlAstroDecli',
      status: 'périmé',
      skillId: skill.id,
      embedUrl: 'https://epreuves.pix.fr/fr/challengeWithEmbedUrlAstro/lilou.html'
    });
    const challengesWithInstruction = domainBuilder.buildChallengeForRelease({
      id: 'challengeWithInstruction',
      status: 'proposé',
      skillId: skill.id,
      instruction: 'Salut clique [ici](https://epreuves.pix.fr/challengesWithInstruction.html) et ça sera bien'
    });
    const challengesWithInstructionOneParam = domainBuilder.buildChallengeForRelease({
      id: 'challengeWithInstructionOneParam',
      status: 'proposé',
      skillId: skill.id,
      instruction: 'Salut clique [ici](https://epreuves.pix.fr/challengesWithInstruction.html?lang=fr)heuuuu'
    });
    const challengesWithInstructionTwoParam = domainBuilder.buildChallengeForRelease({
      id: 'challengeWithInstructionTwoParam',
      status: 'proposé',
      skillId: skill.id,
      instruction: 'Salut clique <a href="https://epreuves.pix.fr/challengesWithInstruction.html?mode=coucou&lang=fr">ici</a>.'
    });
    const otherChallenge = domainBuilder.buildChallengeForRelease({
      id: 'otherChallenge',
      status: 'validé',
      skillId: skill.id,
    });

    const release = domainBuilder.buildDomainRelease.withContent({
      competencesFromRelease: [competence],
      tubesFromRelease: [tube],
      skillsFromRelease: [skill],
      challengesFromRelease: [
        challengeWithEmbedUrl,
        challengeWithEmbedUrlDecli,
        challengeWithEmbedUrlAstro,
        challengeWithEmbedUrlAstroDecli,
        challengesWithInstruction,
        otherChallenge,
        challengesWithInstructionOneParam,
        challengesWithInstructionTwoParam,
      ]
    });

    // when
    const result = findPixEpreuvesUrlsFromChallenges(release);

    // then

    expect(result).toStrictEqual([
      ['pix', 'Ma competence', '@sujet1', 'challengeWithInstruction', 'https://epreuves.pix.fr/challengesWithInstruction.html', 'proposé'],
      ['pix', 'Ma competence', '@sujet1', 'challengeWithInstructionOneParam', 'https://epreuves.pix.fr/challengesWithInstruction.html?lang=fr', 'proposé'],
      ['pix', 'Ma competence', '@sujet1', 'challengeWithInstructionTwoParam', 'https://epreuves.pix.fr/challengesWithInstruction.html?mode=coucou&lang=fr', 'proposé'],
      ['pix', 'Ma competence', '@sujet1', 'challengeWithEmbedUrl', 'https://epreuves.pix.fr/challengeWithEmbedUrl.html?mode=coucou&lang=fr', 'validé'],
      ['pix', 'Ma competence', '@sujet1', 'challengeWithEmbedUrlDecli', 'https://epreuves.pix.fr/challengeWithEmbedUrl.html?mode=lilou&lang=en', 'archivé'],
      ['pix', 'Ma competence', '@sujet1', 'challengeWithEmbedUrlAstro', 'https://epreuves.pix.fr/fr/challengeWithEmbedUrlAstro/coucou.html', 'validé'],
      ['pix', 'Ma competence', '@sujet1', 'challengeWithEmbedUrlAstroDecli', 'https://epreuves.pix.fr/fr/challengeWithEmbedUrlAstro/lilou.html', 'périmé'],
    ]);
  });
});
