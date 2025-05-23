import { describe, expect, it } from 'vitest';
import * as countryRepository from '../../../../lib/infrastructure/repositories/country-repository.js';

describe('Integration | Repository | country-repository', () => {

  describe('#list', () => {
    it('should return the list of all countries', async () => {
      // given
      // when
      const countries = await countryRepository.list();

      // then
      expect(countries).toHaveLength(261);
    });
  });
});
