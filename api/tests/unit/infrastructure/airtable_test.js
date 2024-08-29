import { describe, expect, it } from 'vitest';
import * as airtable from '../../../lib/infrastructure/airtable.js';

describe('Unit | Infrastructure | Airtable', () => {
  describe('#stringValue', () => {
    it('should prepare a string value for airtable formula', async () => {
      // given
      const rawStrings = [
        'coucou',
        '\\\'"\n\r\t coucou \\\'"\n\r\t',
      ];

      // when
      const airtableStringValues = rawStrings.map((rawString) => airtable.stringValue(rawString));

      // then
      expect(airtableStringValues).toStrictEqual([
        '"coucou"',
        '"\\\\\'\\"\\n\\t coucou \\\\\'\\"\\n\\t"',
      ]);
    });
  });
});
