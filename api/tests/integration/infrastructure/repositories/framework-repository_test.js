import { afterEach, describe, expect, it, vi } from 'vitest';
import Airtable from 'airtable';

import { create } from '../../../../lib/infrastructure/repositories/framework-repository.js';
import * as airtable from '../../../../lib/infrastructure/airtable.js';
import { knex } from '../../../test-helper.js';
import { Framework } from '../../../../lib/domain/models/Framework.js';

const TABLE_NAME = 'frameworks';
const AIRTABLE_NAME = 'Referentiel';

describe('Integration | Infrastructure | Repositories | Framework', () => {
  describe('#create', () => {
    afterEach(async () => {
      await knex.delete().from(TABLE_NAME);
    });

    it('inserts framework in Airtable and Postgres', async () => {
      // given
      const id = 'rec123Abc456Def';
      const name = 'Nouveau référentiel';

      const createRecord = vi.spyOn(airtable, 'createRecord').mockResolvedValueOnce(
        new Airtable.Record(AIRTABLE_NAME, id, {
          fields: {
            Nom: name,
            'Domaines (identifiants)': [],
          },
        }),
      );

      const framework = new Framework({ name });

      // when
      const createdFramework = await create(framework);

      // then
      expect(createdFramework).toStrictEqual(new Framework({
        id,
        name,
        areaIds: [],
      }));

      expect(createRecord).toHaveBeenCalledExactlyOnceWith(AIRTABLE_NAME, {
        fields: {
          Nom: name,
        },
      });

      await expect(knex.select('*').from(TABLE_NAME)).resolves.toStrictEqual([
        {
          id,
          name,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);
    });
  });
});
