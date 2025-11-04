import { describe, expect, it, vi } from 'vitest';
import Airtable from 'airtable';

import { create, list } from '../../../../lib/infrastructure/repositories/framework-repository.js';
import * as airtable from '../../../../lib/infrastructure/airtable.js';
import { databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import { Framework } from '../../../../lib/domain/models/Framework.js';
import { frameworkDatasource } from '../../../../lib/infrastructure/datasources/airtable/framework-datasource.js';

const TABLE_NAME = 'frameworks';
const AIRTABLE_NAME = 'Referentiel';

describe('Integration | Infrastructure | Repositories | Framework', () => {
  describe('#create', () => {
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
      expect(createdFramework).toStrictEqual(
        new Framework({
          id,
          name,
          areaIds: [],
        }),
      );

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

  describe('#list', () => {
    it('lists all frameworks w/ attached area ids', async () => {
      // given
      const findRecords = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce([
        new Airtable.Record(AIRTABLE_NAME, 'recFmk1', {
          fields: {
            Nom: 'Premier framework',
            'Domaines (identifiants)': ['recArea1', 'recArea2'],
            'Domaines (identifiants) (id persistant)': ['area1', 'area2'],
          },
        }),
        new Airtable.Record(AIRTABLE_NAME, 'recFmk2', {
          fields: {
            Nom: 'Deuxième framework',
            'Domaines (identifiants)': ['recArea3', 'recArea4', 'recArea5'],
            'Domaines (identifiants) (id persistant)': ['area3', 'area4', 'area5'],
          },
        }),
      ]);

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
          areaIds: ['recArea1', 'recArea2'],
        }),
        domainBuilder.buildFramework({
          id: 'recFmk2',
          name: 'Deuxième framework',
          areaIds: ['recArea3', 'recArea4', 'recArea5'],
        }),
      ]);

      expect(findRecords).toHaveBeenCalledExactlyOnceWith(AIRTABLE_NAME, {
        fields: frameworkDatasource.usedFields,
        sort: [{ direction: 'asc', field: frameworkDatasource.sortField }],
      });
    });
  });
});
