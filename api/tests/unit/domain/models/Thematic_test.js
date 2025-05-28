import {  describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';

describe('Unit | Domain | Thematic', () => {
  describe('#prepareForCreation', () => {
    it('sets fields for creation', () => {
      // given
      const thematic = domainBuilder.buildThematic({
        index: null,
      });
      const competenceThematics = [
        domainBuilder.buildThematic(),
        domainBuilder.buildThematic(),
      ];

      // when
      thematic.prepareForCreation(competenceThematics);

      // then
      expect(thematic).toHaveProperty('index', 2);
    });
  });
});
