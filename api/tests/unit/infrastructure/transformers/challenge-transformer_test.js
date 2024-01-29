import { describe, expect, it } from 'vitest';
import { createChallengeTransformer } from '../../../../lib/infrastructure/transformers/challenge-transformer.js';
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
            embedUrl: 'https://epreuves.pix.fr/mon-embed.html?mode=a&lang=fr#123456',
            status: null,
          }),
          new LocalizedChallenge({
            id: 'localized-challenge-en-id',
            challengeId: 'challenge-id',
            embedUrl: 'https://epreuves.pix.fr/mon-embed.html?mode=a&lang=en-US#7890',
            locale: 'en',
            status: 'proposé',
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
          status: 'validé',
          localizedChallenges,
          locales: ['fr', 'fr-fr'],
          files: [],
        });

        // when
        const transform = createChallengeTransformer({ attachments, localizedChallenges });
        const result = transform(challenge);

        // then
        expect(result).to.deep.equal([
          _buildReleaseChallenge({
            ...challenge,
            id: 'challenge-id',
            embedUrl: 'https://epreuves.pix.fr/mon-embed.html?mode=a&lang=fr#123456',
            locales: ['fr', 'fr-fr'],
            instruction: 'Consigne',
            alternativeInstruction: 'Consigne alternative',
            proposals: 'Propositions',
          }),
          _buildReleaseChallenge({
            ...challenge,
            id: 'localized-challenge-en-id',
            embedUrl: 'https://epreuves.pix.fr/mon-embed.html?mode=a&lang=en-US#7890',
            locales: ['en'],
            instruction: 'English instructions',
            alternativeInstruction: 'Alternative english instructions',
            proposals: '',
            status: 'proposé',
          }),
        ]);
      });
    });

    [
      { challengeStatus: 'proposé', localizedChallengeStatus: 'proposé', expectedLocalizedChallengeStatus: 'proposé' },
      { challengeStatus: 'proposé', localizedChallengeStatus: 'validé', expectedLocalizedChallengeStatus: 'proposé' },
      { challengeStatus: 'validé', localizedChallengeStatus: 'proposé', expectedLocalizedChallengeStatus: 'proposé' },
      { challengeStatus: 'validé', localizedChallengeStatus: 'validé', expectedLocalizedChallengeStatus: 'validé' },
      { challengeStatus: 'archivé', localizedChallengeStatus: 'proposé', expectedLocalizedChallengeStatus: 'proposé' },
      { challengeStatus: 'archivé', localizedChallengeStatus: 'validé', expectedLocalizedChallengeStatus: 'archivé' },
      { challengeStatus: 'périmé', localizedChallengeStatus: 'proposé', expectedLocalizedChallengeStatus: 'périmé' },
      { challengeStatus: 'périmé', localizedChallengeStatus: 'validé', expectedLocalizedChallengeStatus: 'périmé' },
    ].forEach(({ challengeStatus, localizedChallengeStatus, expectedLocalizedChallengeStatus }) => {
      it(`when challenge is '${challengeStatus}' and localized challenge is '${localizedChallengeStatus}', it should export '${expectedLocalizedChallengeStatus} in release'`, async function() {
        // given
        const attachments = [];
        const localizedChallenges = [
          new LocalizedChallenge({
            id: 'challenge-id',
            challengeId: 'challenge-id',
            locale: 'fr',
            embedUrl: 'https://epreuves.pix.fr/mon-embed.html?mode=a&lang=fr#123456',
            status: null,
          }),
          new LocalizedChallenge({
            id: 'localized-challenge-en-id',
            challengeId: 'challenge-id',
            embedUrl: 'https://epreuves.pix.fr/mon-embed.html?mode=a&lang=en-US#7890',
            locale: 'en',
            status: localizedChallengeStatus,
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
          status: challengeStatus,
          localizedChallenges,
          locales: ['fr', 'fr-fr'],
          files: [],
        });

        // when
        const transform = createChallengeTransformer({ attachments, localizedChallenges });
        const result = transform(challenge);

        // then
        expect(result).to.deep.equal([
          _buildReleaseChallenge({
            ...challenge,
            id: 'challenge-id',
            embedUrl: 'https://epreuves.pix.fr/mon-embed.html?mode=a&lang=fr#123456',
            locales: ['fr', 'fr-fr'],
            instruction: 'Consigne',
            alternativeInstruction: 'Consigne alternative',
            proposals: 'Propositions',
          }),
          _buildReleaseChallenge({
            ...challenge,
            id: 'localized-challenge-en-id',
            embedUrl: 'https://epreuves.pix.fr/mon-embed.html?mode=a&lang=en-US#7890',
            locales: ['en'],
            instruction: 'English instructions',
            alternativeInstruction: 'Alternative english instructions',
            proposals: '',
            status: expectedLocalizedChallengeStatus,
          }),
        ]);
      });
    });

    describe('when there is one localized challenge', () => {
      it('should transform and translate challenge', () => {
        // given
        const attachments = [];
        const localizedChallengeFr = new LocalizedChallenge({
          id: 'fr-challenge-id',
          challengeId: 'challenge-id',
          locale: 'fr-fr',
          status: 'validé',
        });
        const localizedChallengeNl = new LocalizedChallenge({
          id: 'nl-challenge-id',
          challengeId: 'challenge-id',
          locale: 'nl-be',
          embedUrl: 'https://epreuves.pix.fr/mon-embed.html?lang=nl-be&mode=a#123456',
          status: 'validé',
        });
        const challenge = domainBuilder.buildChallenge({
          id: 'challenge-id',
          embedUrl: 'https://epreuves.pix.fr/mon-embed.html?lang=fr&mode=a#123456',
          translations: {
            fr: {
              instruction: 'Consigne fr',
              alternativeInstruction: 'Consigne alternative fr',
              proposals: 'Propositions fr',
            },
            'nl-be': {
              instruction: 'Volgorde nl',
              alternativeInstruction: 'Alternatieve instructie nl',
              proposals: 'Voorstellen nl',
            },
          },
          localizedChallenges: [localizedChallengeFr, localizedChallengeNl],
          locales: ['fr', 'fr-fr'],
          files: [],
        });

        // when
        const transform = createChallengeTransformer({ attachments, localizedChallenge: localizedChallengeNl });
        const result = transform(challenge);

        // then
        expect(result).to.deep.equal(
          _buildReleaseChallenge({
            ...challenge,
            id: 'nl-challenge-id',
            embedUrl: 'https://epreuves.pix.fr/mon-embed.html?lang=nl-be&mode=a#123456',
            locales: ['nl-be'],
            instruction: 'Volgorde nl',
            alternativeInstruction: 'Alternatieve instructie nl',
            proposals: 'Voorstellen nl',
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
