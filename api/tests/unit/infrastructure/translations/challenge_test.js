import { describe, expect, it } from 'vitest';

import { extractFromChallenge, prefixFor } from '../../../../lib/infrastructure/translations/challenge.js';
import { Challenge, LocalizedChallenge } from '../../../../lib/domain/models/index.js';

describe('Unit | Infrastructure | Challenge translations', () => {

  describe('#extractFromChallenge', () => {
    it('should extract translations from challenge', () => {
      const challengeId = 'test';
      const challenge = new Challenge({
        id: challengeId,
        translations: {
          fr: {
            instruction: 'consigne en français',
            alternativeInstruction: 'consigne alternative en français',
            proposals: 'propositions en français',
            solution: 'bonnes réponses en français',
            solutionToDisplay: 'bonnes réponses à afficher en français',
            embedTitle: 'titre du simulateur',
          }
        },
        locales: ['fr'],
        localizedChallenges: [
          new LocalizedChallenge({ id: challengeId, challengeId, locale: 'fr' }),
        ],
      });
      const translations = extractFromChallenge(challenge);
      expect(translations).to.deep.equal([
        {
          key: `challenge.${challengeId}.instruction`,
          locale: 'fr',
          value: 'consigne en français',
        },
        {
          key: `challenge.${challengeId}.alternativeInstruction`,
          locale: 'fr',
          value: 'consigne alternative en français'
        },
        {
          key: `challenge.${challengeId}.proposals`,
          locale: 'fr',
          value: 'propositions en français',
        },
        {
          key: `challenge.${challengeId}.solution`,
          locale: 'fr',
          value: 'bonnes réponses en français',
        },
        {
          key: `challenge.${challengeId}.solutionToDisplay`,
          locale: 'fr',
          value: 'bonnes réponses à afficher en français'
        },
        {
          key: `challenge.${challengeId}.embedTitle`,
          locale: 'fr',
          value: 'titre du simulateur',
        },
      ]);
    });

    it('should extract the correct locale from the challenge', () => {
      const challengeId = 'test';
      const challenge = new Challenge({
        id: challengeId,
        translations: {
          fr: {
            instruction: 'consigne en français',
            alternativeInstruction: 'consigne alternative en français',
            proposals: 'propositions en français',
            solution: 'bonnes réponses en français',
            solutionToDisplay: 'bonnes réponses à afficher en français',
          }
        },
        locales: ['fr-fr', 'fr'],
        localizedChallenges: [
          new LocalizedChallenge({ id: challengeId, challengeId, locale: 'fr' }),
        ],
      });
      const translations = extractFromChallenge(challenge);
      expect(translations).to.deep.equal([
        { key: `challenge.${challengeId}.instruction`, locale: 'fr', value: 'consigne en français' },
        {
          key: `challenge.${challengeId}.alternativeInstruction`,
          locale: 'fr',
          value: 'consigne alternative en français'
        },
        { key: `challenge.${challengeId}.proposals`, locale: 'fr', value: 'propositions en français' },
        { key: `challenge.${challengeId}.solution`, locale: 'fr', value: 'bonnes réponses en français' },
        {
          key: `challenge.${challengeId}.solutionToDisplay`,
          locale: 'fr',
          value: 'bonnes réponses à afficher en français'
        },
      ]);
    });

    it('should filter empty translations from challenge', () => {
      const challengeId = 'test';
      const challenge = new Challenge({
        id: challengeId,
        translations: {
          fr: {
            instruction: 'consigne en français',
            alternativeInstruction: '',
            proposals: 'propositions en français',
            solution: 'bonnes réponses en français',
            solutionToDisplay: 'bonnes réponses à afficher en français',
          }
        },
        locales: ['fr'],
        localizedChallenges: [
          new LocalizedChallenge({ id: challengeId, challengeId, locale: 'fr' }),
        ],
      });
      const translations = extractFromChallenge(challenge);
      expect(translations).to.deep.equal([
        { key: `challenge.${challengeId}.instruction`, locale: 'fr', value: 'consigne en français' },
        { key: `challenge.${challengeId}.proposals`, locale: 'fr', value: 'propositions en français' },
        { key: `challenge.${challengeId}.solution`, locale: 'fr', value: 'bonnes réponses en français' },
        {
          key: `challenge.${challengeId}.solutionToDisplay`,
          locale: 'fr',
          value: 'bonnes réponses à afficher en français'
        },
      ]);
    });
  });

  describe('#prefixFor', () => {
    it('should return prefix for challenge fields keys', () => {
      const challengeId = 'recTestChallenge';
      // given
      const challenge = new Challenge({
        id: challengeId,
        translations: { fr: {} },
        localizedChallenges: [
          new LocalizedChallenge({ id: challengeId, challengeId, locale: 'fr' }),
        ],
      });

      // when
      const prefix = prefixFor(challenge);

      // then
      expect(prefix).toBe('challenge.recTestChallenge.');
    });
  });
});
