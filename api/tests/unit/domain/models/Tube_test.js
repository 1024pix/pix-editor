import {  describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';

describe('Unit | Domain | Tube', () => {
  describe('#get isWorkbench', () => {
    it('is true when name is @workbench', () => {
      // given
      const tube  = domainBuilder.buildTube({
        name: '@workbench',
      });

      // when
      const { isWorkbench } = tube;

      // then
      expect(isWorkbench).toBe(true);
    });

    it('is false when name os @workbench', () => {
      // given
      const tube  = domainBuilder.buildTube({
        name: '@test',
      });

      // when
      const { isWorkbench } = tube;

      // then
      expect(isWorkbench).toBe(false);
    });
  });
});
