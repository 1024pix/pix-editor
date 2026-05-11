import { describe, expect, it } from 'vitest';
import { Module } from '../../../../lib/domain/models/index.js';

const uuidRegExp = /^\p{Hex_Digit}{8}-\p{Hex_Digit}{4}-\p{Hex_Digit}{4}-\p{Hex_Digit}{4}-\p{Hex_Digit}{12}$/u;
const shortIdRegExp = /^\p{Hex_Digit}{8}$/u;

describe('Unit | Domain | Module', () => {
  describe('#prepareForCreation', () => {
    it('computes fields for creation', () => {
      // given
      const module = new Module();

      // when
      module.prepareForCreation();

      // then
      expect(module.id).toMatch(uuidRegExp);
      expect(module.shortId).toMatch(shortIdRegExp);
    });
  });
});
