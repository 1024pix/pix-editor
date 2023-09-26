import { describe, expect, it } from 'vitest';
import { extractFromChallenge, hydrateToAirtableObject } from '../../../../lib/infrastructure/translations/challenge.js';

describe('Unit | Infrastructure | Challenge translations', () => {

  describe('#extractFromAirtableObject', () => {
    it('should extract translations from challenge', () => {
      const challenge = {
        id: 'test',
        instruction: 'consigne en français',
        alternativeInstruction: 'consigne alternative en français',
        proposals: 'propositions en français',
        solution: 'bonnes réponses en français',
        solutionToDisplay: 'bonnes réponses à afficher en français',
        locales: ['fr']
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
  });

});
