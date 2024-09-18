import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { Thematic } from '../../../../lib/domain/models/index.js';

describe('Unit | Domain | Thematic', () => {
  describe('#get isWorkbench', () => {
    it('should return true when thematic is workbench', () => {
      // given
      const thematic  = domainBuilder.buildThematic({
        name_i18n: {
          'fr': `${Thematic.WORKBENCH}_desbisous`,
        },
      });

      // when
      const isWorkbench = thematic.isWorkbench;

      // then
      expect(isWorkbench).to.be.true;
    });

    it('should return false when thematic is not workbench', () => {
      // given
      const thematic  = domainBuilder.buildThematic({
        name_i18n: {
          'fr': 'ma super thématique',
        },
      });

      // when
      const isWorkbench = thematic.isWorkbench;

      // then
      expect(isWorkbench).to.be.false;
    });
  });
});
