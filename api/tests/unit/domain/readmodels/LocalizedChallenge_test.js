import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../tooling/domain-builder/domain-builder.js';
import { Challenge, LocalizedChallenge } from '../../../../lib/domain/models/index.js';
import { LocalizedChallenge as LocalizedChallengeRead } from '../../../../lib/domain/readmodels/index.js';

describe('Unit | Domain | Readmodels | LocalizedChallenge', () => {
  describe('static #buildFromChallengeAndLocale', () => {
    it('should build a LocalizedChallenge readmodel from given challenge and locale', () => {
      // given
      const challenge = domainBuilder.buildChallenge({
        id: 'challengeId',
        status: Challenge.STATUSES.VALIDE,
        localizedChallenges: [
          domainBuilder.buildLocalizedChallenge({
            id: 'challengeId',
            challengeId: 'challengeId',
            locale: 'fr',
            status: LocalizedChallenge.STATUSES.PRIMARY,
          }),
          domainBuilder.buildLocalizedChallenge({
            id: 'challengeNlId',
            challengeId: 'challengeId',
            locale: 'nl',
            status: LocalizedChallenge.STATUSES.PLAY,
          }),
        ],
        translations: {
          fr: {
            instruction: 'Je men fiche',
          },
          nl: {
            instruction: 'Da Da Da',
          },
        },
      });

      // when
      const localizedChallengeRead = LocalizedChallengeRead.buildFromChallengeAndLocale(challenge, 'nl');

      // then
      expect(localizedChallengeRead).toStrictEqual(
        domainBuilder.buildLocalizedChallengeRead({
          id: 'challengeNlId',
          challengeId: 'challengeId',
          locale: 'nl',
          instruction: 'Da Da Da',
          status: LocalizedChallenge.STATUSES.PLAY,
        }),
      );
    });
  });
});
