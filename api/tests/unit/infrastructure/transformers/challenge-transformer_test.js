import { describe, expect, it } from 'vitest';
import * as challengeTransformer from '../../../../lib/infrastructure/transformers/challenge-transformer.js';
import { LocalizedChallenge } from '../../../../lib/domain/models/LocalizedChallenge.js';
import { domainBuilder } from '../../../test-helper.js';

describe('Unit | Infrastructure | Challenge Transformer', function() {

  describe('#createChallengeTransformer', function() {
    describe('when there are several localized challenges', () => {
      it('should return transformed challenges', async function() {
        // given
        const attachments = [];
        const localizedChallenges = [
          new LocalizedChallenge({
            id: 'challenge-id',
            challengeId: 'challenge-id',
            locale: 'fr',
          }),
          new LocalizedChallenge({
            id: 'localized-challenge-en-id',
            challengeId: 'challenge-id',
            locale: 'en',
          }),
          new LocalizedChallenge({
            id: 'other-challenge-id',
            challengeId: 'other-challenge-id',
            locale: 'nl-be',
          }),
        ];
        const challenge = domainBuilder.buildChallenge({
          id: 'challenge-id',
          translations: {
            fr: {
              instruction: 'Consigne',
              alternativeInstruction: 'Consigne alternative',
            },
            en: {
              instruction: 'English instructions',
              alternativeInstruction: 'Alternative english instructions',
            },
          },
          locales: ['fr', 'fr-fr'],
        });

        // when
        const transform = challengeTransformer.createChallengeTransformer({ attachments, localizedChallenges });
        const result = transform(challenge);

        // then
        expect(result).to.deep.equal([
          _buildReleaseChallenge({
            ...challenge,
            id: 'challenge-id',
            locales: ['fr', 'fr-fr'],
            instruction: 'Consigne',
            alternativeInstruction: 'Consigne alternative',
          }),
          _buildReleaseChallenge({
            ...challenge,
            id: 'localized-challenge-en-id',
            locales: ['en'],
            instruction: 'English instructions',
            alternativeInstruction: 'Alternative english instructions',
          })
        ]);
      });
    });
  });
});

function _buildReleaseChallenge({
  id,
  instruction,
  proposals,
  type,
  solution,
  solutionToDisplay,
  t1Status,
  t2Status,
  t3Status,
  status,
  skillId,
  embedUrl,
  embedTitle,
  embedHeight,
  timer,
  competenceId,
  format,
  autoReply,
  locales,
  alternativeInstruction,
  genealogy,
  responsive,
  focusable,
  delta,
  alpha,
  attachments,
  illustrationUrl = null,
  illustrationAlt = null,
  shuffled,
  alternativeVersion,
}) {
  const releaseChallenge = {
    id,
    instruction,
    proposals,
    type,
    solution,
    solutionToDisplay,
    t1Status,
    t2Status,
    t3Status,
    status,
    skillId,
    embedUrl,
    embedTitle,
    embedHeight,
    timer,
    competenceId,
    format,
    autoReply,
    locales,
    alternativeInstruction,
    genealogy,
    responsive,
    focusable,
    delta,
    alpha,
    illustrationUrl,
    illustrationAlt,
    shuffled,
    alternativeVersion,
  };
  if (attachments) {
    releaseChallenge.attachments = attachments;
  }
  return releaseChallenge;
}
