import { describe, expect, it } from 'vitest';
import { createChallengeTransformer } from '../../../../lib/infrastructure/transformers/challenge-transformer.js';
import { domainBuilder } from '../../../test-helper.js';
import { Attachment } from '../../../../lib/domain/models/index.js';

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
        accessibility1: 'A tester',
        accessibility2: 'KO',
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
            type: Attachment.TYPES.ILLUSTRATION,
            url: 'https://dl.example.com/illustration1.jpg',
            challengeId: 'challenge-id',
            localizedChallengeId: 'challenge-id',
          },
          {
            id: 'attId2',
            type: Attachment.TYPES.ILLUSTRATION,
            url: 'https://dl.example.com/illustration2.jpg',
            challengeId: 'other-challenge-id',
            localizedChallengeId: 'other-challenge-id',
          },
          {
            id: 'attId3',
            type: Attachment.TYPES.ILLUSTRATION,
            url: 'https://dl.example.com/illustration1-nl.jpg',
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
              illustrationAlt: 'Un chien qui fait des bulles avec son museau'
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
            illustrationAlt: 'Un chien qui fait des bulles avec son museau',
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
  accessibility1,
  accessibility2,
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
    accessibility1,
    accessibility2,
  };
  if (attachments) {
    releaseChallenge.attachments = attachments;
  }
  return releaseChallenge;
}
