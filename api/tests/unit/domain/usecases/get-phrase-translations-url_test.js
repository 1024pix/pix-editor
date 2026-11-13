import { describe, expect, it } from 'vitest';
import { toPhraseLocaleCode } from '../../../../lib/domain/usecases/get-phrase-translations-url.js';

describe('Unit | Domain | Usecases | get-phrase-translations-url', () => {
  describe('#toPhraseLocaleCode', () => {
    it('should map de-AT to de', () => {
      expect(toPhraseLocaleCode('de-AT')).toBe('de');
    });

    it('should return the locale unchanged when no mapping exists', () => {
      expect(toPhraseLocaleCode('nl')).toBe('nl');
      expect(toPhraseLocaleCode('en-UG')).toBe('en-UG');
    });
  });
});
