import { describe, expect, it } from 'vitest';
import { areLocalesEqual } from '../../../../lib/infrastructure/utils/locale-utils.js';

describe('Unit | Utils | Locale Utils', function() {
  describe('areLocalesEqual', function() {
    it.each([
      [
        'fr',
        'fr',
        true,
      ],
      [
        'fr',
        'FR',
        true,
      ],
      [
        'fr-fr',
        'fr-fr',
        true,
      ],
      [
        'fr-fr',
        'fr-FR',
        true,
      ],
      [
        'FR-fr',
        'FR-FR',
        true,
      ],
      [
        'fr',
        'fr-FR',
        false,
      ],
    ])('returns $2 when comparing $0 and $1', (locale1, locale2, expected) => {
      // when
      const actual = areLocalesEqual(locale1, locale2);

      // then
      expect(actual).toBe(expected);
    });
  });
});
