import { describe, expect, it } from 'vitest';
import { escapeLikeWildcards } from '../../../../lib/infrastructure/repositories/sql-utils';

describe('Unit | Infrastructure | Repositories | SQL Utils', () => {
  describe('#escapeLikeWildcards', () => {
    it('escapes underscores and percentages', () => {
      expect(escapeLikeWildcards('_%_% Plop %%__')).toBe('\\_\\%\\_\\% Plop \\%\\%\\_\\_');
    });
  });
});
