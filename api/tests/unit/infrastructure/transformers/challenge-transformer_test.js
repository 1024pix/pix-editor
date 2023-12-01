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
              proposals: 'Propositions',
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
            proposals: 'Propositions',
          }),
          _buildReleaseChallenge({
            ...challenge,
            id: 'localized-challenge-en-id',
            locales: ['en'],
            instruction: 'English instructions',
            alternativeInstruction: 'Alternative english instructions',
            proposals: '',
          }),
        ]);
      });
    });

    describe('when there is one localized challenge', () => {
      it('should transform and translate challenge', () => {
        // given
        const attachments = [];
        const localizedChallenge = new LocalizedChallenge({
          id: 'nl-challenge-id',
          challengeId: 'challenge-id',
          locale: 'nl-be',
        });
        const challenge = domainBuilder.buildChallenge({
          id: 'challenge-id',
          translations: {
            fr: {
              instruction: 'Consigne',
              alternativeInstruction: 'Consigne alternative',
              proposals: 'Propositions',
            },
            'nl-be': {
              instruction: 'Volgorde',
              alternativeInstruction: 'Alternatieve instructie',
              proposals: 'Voorstellen',
            },
          },
          locales: ['fr', 'fr-fr'],
        });

        // when
        const transform = challengeTransformer.createChallengeTransformer({ attachments, localizedChallenge });
        const result = transform(challenge);

        // then
        expect(result).to.deep.equal(
          _buildReleaseChallenge({
            ...challenge,
            id: 'nl-challenge-id',
            locales: ['nl-be'],
            instruction: 'Volgorde',
            alternativeInstruction: 'Alternatieve instructie',
            proposals: 'Voorstellen',
          }),
        );
      });
    });

    describe('when there are no localized challenge at all', () => {
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
        });

        // when
        const transform = challengeTransformer.createChallengeTransformer({ attachments });
        const result = transform(challenge);

        // then
        expect(result).to.deep.equal(
          _buildReleaseChallenge(challenge),
        );
      });
    });

    describe('when there are attachments', () => {
      it ('should add these on the challenge', () => {
        // given
        const attachments = [
          { url: 'https://dl.example.com/attachment1.xlsx', challengeId: 'challenge-id' },
          { url: 'https://dl.example.com/attachment1.csv', challengeId: 'challenge-id' },
          { url: 'https://dl.example.com/attachment2.txt', challengeId: 'other-challenge-id' },
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
        });

        // when
        const transform = challengeTransformer.createChallengeTransformer({ attachments });
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
      it ('should add it on the challenge', () => {
        // given
        const attachments = [
          {
            type: 'illustration',
            url: 'https://dl.example.com/illustration1.jpg',
            alt: 'A dog making bubbles with his nose',
            challengeId: 'challenge-id',
          },
          {
            type: 'illustration',
            url: 'https://dl.example.com/illustration2.jpg',
            alt: 'A cat doing nothing cause he is useless',
            challengeId: 'other-challenge-id',
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
        });

        // when
        const transform = challengeTransformer.createChallengeTransformer({ attachments });
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
