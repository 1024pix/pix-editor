import { describe, expect, it, vi } from 'vitest';

import { create, list } from '../../../../lib/infrastructure/repositories/framework-repository.js';
import { databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import { Framework } from '../../../../lib/domain/models/Framework.js';
import * as idGenerator from '../../../../lib/infrastructure/utils/id-generator.js';

const TABLE_NAME = 'frameworks';

describe('Integration | Infrastructure | Repositories | Framework', () => {
  describe('#create', () => {
    it('inserts framework', async () => {
      // given
      const id = 'framework123Abc';
      const name = 'Nouveau référentiel';

      const generateNewId = vi.spyOn(idGenerator, 'generateNewId').mockReturnValueOnce(id);

      const framework = new Framework({ name });

      // when
      const createdFramework = await create(framework);

      // then
      expect(createdFramework).toStrictEqual(
        new Framework({
          id,
          name,
          areaIds: [],
        }),
      );

      await expect(knex.select('*').from(TABLE_NAME)).resolves.toStrictEqual([
        {
          id,
          name,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);

      expect(generateNewId).toHaveBeenCalledExactlyOnceWith('framework');
    });
  });

  describe('#list', () => {
    it('lists all frameworks w/ attached area ids', async () => {
      // given
      databaseBuilder.factory.buildFramework({
        id: 'recFmk1',
        name: 'Premier framework',
        createdAt: '20250904T14:37:00Z',
      });
      databaseBuilder.factory.buildArea({
        id: 'area1',
        code: '1',
        frameworkId: 'recFmk1',
      });
      databaseBuilder.factory.buildArea({
        id: 'area2',
        code: '2',
        frameworkId: 'recFmk1',
      });
      databaseBuilder.factory.buildFramework({
        id: 'recFmk2',
        name: 'Deuxième framework',
        createdAt: '20250904T14:38:00Z',
      });
      databaseBuilder.factory.buildArea({
        id: 'area3',
        code: '3',
        frameworkId: 'recFmk2',
      });
      databaseBuilder.factory.buildArea({
        id: 'area4',
        code: '4',
        frameworkId: 'recFmk2',
      });
      databaseBuilder.factory.buildArea({
        id: 'area5',
        code: '5',
        frameworkId: 'recFmk2',
      });
      await databaseBuilder.commit();

      // when
      const frameworks = await list();

      // then
      expect(frameworks).toStrictEqual([
        domainBuilder.buildFramework({
          id: 'recFmk1',
          name: 'Premier framework',
          areaIds: ['area1', 'area2'],
        }),
        domainBuilder.buildFramework({
          id: 'recFmk2',
          name: 'Deuxième framework',
          areaIds: [
            'area3',
            'area4',
            'area5',
          ],
        }),
      ]);
    });
  });
});
