import { describe, expect, it } from 'vitest';
import { extractFromChallenge } from '../../../../lib/infrastructure/translations/challenge.js';

describe('Unit | Infrastructure | Challenge translations', () => {

  describe('#extractFromChallenge', () => {
    it('should extract translations from challenge', () => {
      const challenge = {
        id: 'test',
        instruction: 'consigne en français',
        alternativeInstruction: 'consigne alternative en français',
        proposals: 'propositions en français',
        solution: 'bonnes réponses en français',
        solutionToDisplay: 'bonnes réponses à afficher en français',
        locales: ['fr'],
      };
      const translations = extractFromChallenge(challenge);
      expect(translations).to.deep.equal([
        { key: 'challenge.test.instruction', locale: 'fr', value: 'consigne en français' },
        { key: 'challenge.test.alternativeInstruction', locale: 'fr', value: 'consigne alternative en français' },
        { key: 'challenge.test.proposals', locale: 'fr', value: 'propositions en français' },
        { key: 'challenge.test.solution', locale: 'fr', value: 'bonnes réponses en français' },
        { key: 'challenge.test.solutionToDisplay', locale: 'fr', value: 'bonnes réponses à afficher en français' },
      ]);
    });

    it('should extract the correct locale from the challenge', () => {
      const challenge = {
        id: 'test',
        instruction: 'consigne en français',
        alternativeInstruction: 'consigne alternative en français',
        proposals: 'propositions en français',
        solution: 'bonnes réponses en français',
        solutionToDisplay: 'bonnes réponses à afficher en français',
        locales: ['fr-fr', 'fr'],
      };
      const translations = extractFromChallenge(challenge);
      expect(translations).to.deep.equal([
        { key: 'challenge.test.instruction', locale: 'fr', value: 'consigne en français' },
        { key: 'challenge.test.alternativeInstruction', locale: 'fr', value: 'consigne alternative en français' },
        { key: 'challenge.test.proposals', locale: 'fr', value: 'propositions en français' },
        { key: 'challenge.test.solution', locale: 'fr', value: 'bonnes réponses en français' },
        { key: 'challenge.test.solutionToDisplay', locale: 'fr', value: 'bonnes réponses à afficher en français' },
      ]);
    });

    it('should filter empty translations from challenge', () => {
      const challenge = {
        id: 'test',
        instruction: 'consigne en français',
        alternativeInstruction: '',
        proposals: 'propositions en français',
        solution: 'bonnes réponses en français',
        solutionToDisplay: 'bonnes réponses à afficher en français',
        locales: ['fr'],
      };
      const translations = extractFromChallenge(challenge);
      expect(translations).to.deep.equal([
        { key: 'challenge.test.instruction', locale: 'fr', value: 'consigne en français' },
        { key: 'challenge.test.proposals', locale: 'fr', value: 'propositions en français' },
        { key: 'challenge.test.solution', locale: 'fr', value: 'bonnes réponses en français' },
        { key: 'challenge.test.solutionToDisplay', locale: 'fr', value: 'bonnes réponses à afficher en français' },
      ]);
    });
  });

});
