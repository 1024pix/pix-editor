import { describe, expect, it } from 'vitest';
import { createChallengeTransformer } from '../../../../lib/infrastructure/transformers/challenge-transformer.js';
import { domainBuilder } from '../../../test-helper.js';

describe('Unit | Infrastructure | Challenge Transformer', function() {

  describe('#createChallengeTransformer', function() {

    it('should transform challenge', () => {
      // given
      const attachments = [];
      const challenge = domainBuilder.buildChallenge({
        id: 'challenge-id',
        translations: {
          fr: {
            instruction: 'Consigne',
            alternativeInstruction: 'Consigne alternative',
            proposals: 'Propositions',
          },
        },
        locales: ['fr', 'fr-fr'],
        files: [],
      });

      // when
      const transform = createChallengeTransformer({ attachments });
      const result = transform(challenge);

      // then
      expect(result).to.deep.equal(
        _buildReleaseChallenge(challenge),
      );
    });

    describe('when there are attachments', () => {
      it('should add these on the challenge', () => {
        // given
        // TODO simplify, we are testing Challenge model instead of transformer
        const attachments = [
          {
            id: 'attId1',
            url: 'https://dl.example.com/attachment1.xlsx',
            challengeId: 'challenge-id',
            localizedChallengeId: 'challenge-id',
          },
          {
            id: 'attId2',
            url: 'https://dl.example.com/attachment1.csv',
            challengeId: 'challenge-id',
            localizedChallengeId: 'challenge-id',
          },
          {
            id: 'attId3',
            url: 'https://dl.example.com/attachment2.txt',
            challengeId: 'other-challenge-id',
            localizedChallengeId: 'other-challenge-id',
          },
          {
            id: 'attId4',
            url: 'https://dl.example.com/attachment2-nl.txt',
            challengeId: 'challenge-id',
            localizedChallengeId: 'challenge-id-nl',
          },
        ];
        const challenge = domainBuilder.buildChallenge({
          id: 'challenge-id',
          translations: {
            fr: {
              instruction: 'Consigne',
              alternativeInstruction: 'Consigne alternative',
              proposals: 'Propositions',
            },
          },
          locales: ['fr', 'fr-fr'],
          files: attachments.map(({ id: fileId, localizedChallengeId }) => ({ fileId, localizedChallengeId }))
        });

        // when
        const transform = createChallengeTransformer({ attachments });
        const result = transform(challenge);

        // then
        expect(result).to.deep.equal(
          _buildReleaseChallenge({
            ...challenge,
            attachments: [
              'https://dl.example.com/attachment1.xlsx',
              'https://dl.example.com/attachment1.csv',
            ],
          }),
        );
      });
    });

    describe('when there is an illustration attachments', () => {
      it('should add it on the challenge', () => {
        // given
        const attachments = [
          {
            id: 'attId1',
            type: 'illustration',
            url: 'https://dl.example.com/illustration1.jpg',
            alt: 'A dog making bubbles with his nose',
            challengeId: 'challenge-id',
            localizedChallengeId: 'challenge-id',
          },
          {
            id: 'attId2',
            type: 'illustration',
            url: 'https://dl.example.com/illustration2.jpg',
            alt: 'A cat doing nothing cause he is useless',
            challengeId: 'other-challenge-id',
            localizedChallengeId: 'other-challenge-id',
          },
          {
            id: 'attId3',
            type: 'illustration',
            url: 'https://dl.example.com/illustration1-nl.jpg',
            alt: 'A dog making bubbles with his nose nl',
            challengeId: 'challenge-id',
            localizedChallengeId: 'challenge-id-nl',
          },
        ];
        const challenge = domainBuilder.buildChallenge({
          id: 'challenge-id',
          translations: {
            fr: {
              instruction: 'Consigne',
              alternativeInstruction: 'Consigne alternative',
              proposals: 'Propositions',
            },
          },
          locales: ['fr', 'fr-fr'],
          files: attachments.map(({ id: fileId, localizedChallengeId }) => ({ fileId, localizedChallengeId }))
        });

        // when
        const transform = createChallengeTransformer({ attachments });
        const result = transform(challenge);

        // then
        expect(result).to.deep.equal(
          _buildReleaseChallenge({
            ...challenge,
            illustrationAlt: 'A dog making bubbles with his nose',
            illustrationUrl: 'https://dl.example.com/illustration1.jpg',
          }),
        );
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
