import { describe, expect, it } from 'vitest';
import { DraftModule } from '../../../../lib/domain/models/index.js';

const uuidRegExp = /^\p{Hex_Digit}{8}-\p{Hex_Digit}{4}-\p{Hex_Digit}{4}-\p{Hex_Digit}{4}-\p{Hex_Digit}{12}$/u;
const shortIdRegExp = /^\p{Hex_Digit}{8}$/u;

describe('Unit | Domain | DraftModule', () => {
  describe('#prepareForCreation', () => {
    it('computes fields for creation', () => {
      // given
      const draftModule = new DraftModule();

      // when
      draftModule.prepareForCreation();

      // then
      expect(draftModule.id).toMatch(uuidRegExp);
      expect(draftModule.shortId).toMatch(shortIdRegExp);
      expect(draftModule.shortId).toBe(draftModule.id.slice(0, 8));
    });
  });
});
