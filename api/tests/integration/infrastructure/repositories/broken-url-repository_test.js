import { describe, expect, it } from 'vitest';
import { databaseBuilder, knex } from '../../../test-helper.js';
import { updateBrokenUrlTable } from '../../../../lib/infrastructure/repositories/broken-url-repository.js';

describe('Integration | Repository | broken-url-repository', () => {
  describe('#updateBrokenUrlTable', () => {
    it('remove and add a list of broken links', async function() {
      databaseBuilder.factory.buildBrokenUrl({ url: 'https://example.com/old-broken-link-1', statusCode: 400 });
      databaseBuilder.factory.buildBrokenUrl({ url: 'https://example.com/old-broken-link-2', statusCode: 404 });
      await databaseBuilder.commit();

      const newlyBrokenUrl1 = { url: 'https://example.com/new-broken-link-1', statusCode: 400 };
      const newlyBrokenUrl2 = { url: 'https://example.com/new-broken-link-2', statusCode: 404, errorMessage: 'URL pas trouvée' };

      await updateBrokenUrlTable([newlyBrokenUrl1, newlyBrokenUrl2]);

      const updatedUrlList = await knex('broken_urls').select('*');

      expect(updatedUrlList).toEqual([
        {
          ...newlyBrokenUrl1,
          errorMessage: null,
        },
        {
          ...newlyBrokenUrl2,
          errorMessage: 'URL pas trouvée',
        },
      ]);
    });
  });
});

