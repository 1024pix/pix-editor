import { describe, expect, it } from 'vitest';

import { databaseBuilder } from '../../../test-helper.js';
import { listByEntityName } from '../../../../lib/infrastructure/repositories/admin-entity-repository.js';

describe('Integration | Infrastructure | Repository | admin-entity-repository', () => {
  describe('#listByEntityName', () => {
    it('should return the list of all entities by name', async () => {
      // given
      const entityName = 'frameworks';
      const fields = ['id', 'name'];
      const pagination = {
        size: 10,
        number: 1,
      };
      const sort = {
        field: 'id',
        direction: 'asc',
      };
      databaseBuilder.factory.buildFramework({ id: 'frameworkId1', name: 'A' });
      databaseBuilder.factory.buildFramework({ id: 'frameworkId2', name: 'B' });
      databaseBuilder.factory.buildFramework({ id: 'frameworkId3', name: 'C' });
      databaseBuilder.factory.buildWhitelistedUrl({ id: 1, comment: 'Not in results' });

      await databaseBuilder.commit();

      // when
      const { entities, meta } = await listByEntityName(entityName, fields, pagination, sort);

      // then
      expect(entities).toEqual([
        {
          id: 'frameworkId1',
          name: 'A',
        },
        {
          id: 'frameworkId2',
          name: 'B',
        },
        {
          id: 'frameworkId3',
          name: 'C',
        },
      ]);
      expect(meta).toEqual({
        page: 1,
        pageCount: 1,
        pageSize: pagination.size,
        rowCount: 3,
      });
    });

    it('should return only given fields', async () => {
      // given
      const entityName = 'frameworks';
      const fields = ['name'];
      const pagination = {
        size: 10,
        number: 1,
      };
      const sort = {
        field: 'id',
        direction: 'asc',
      };
      databaseBuilder.factory.buildFramework({ id: 'frameworkId1', name: 'A' });
      databaseBuilder.factory.buildFramework({ id: 'frameworkId2', name: 'B' });

      await databaseBuilder.commit();

      // when
      const { entities, meta } = await listByEntityName(entityName, fields, pagination, sort);

      // then
      expect(entities).toEqual([{ name: 'A' }, { name: 'B' }]);
      expect(meta).toEqual({
        page: 1,
        pageCount: 1,
        pageSize: pagination.size,
        rowCount: 2,
      });
    });

    it('should return sorted entities based on sort param', async () => {
      // given
      const entityName = 'frameworks';
      const fields = ['name'];
      const pagination = {
        size: 10,
        number: 1,
      };
      const sort = {
        field: 'name',
        direction: 'desc',
      };
      databaseBuilder.factory.buildFramework({ id: 'frameworkId1', name: 'A' });
      databaseBuilder.factory.buildFramework({ id: 'frameworkId2', name: 'Z' });
      databaseBuilder.factory.buildFramework({ id: 'frameworkId3', name: 'N' });

      await databaseBuilder.commit();

      // when
      const { entities, meta } = await listByEntityName(entityName, fields, pagination, sort);

      // then
      expect(entities).toEqual([
        { name: 'Z' },
        { name: 'N' },
        { name: 'A' },
      ]);
      expect(meta).toEqual({
        page: 1,
        pageCount: 1,
        pageSize: pagination.size,
        rowCount: 3,
      });
    });

    describe('when pagination.size is smaller than entities count', () => {
      it('should return only pagination.size elements', async () => {
        // given
        const entityName = 'frameworks';
        const fields = ['id', 'name'];
        const pagination = {
          size: 2,
          number: 1,
        };
        const sort = {
          field: 'id',
          direction: 'asc',
        };
        databaseBuilder.factory.buildFramework({ id: 'frameworkId1', name: 'A' });
        databaseBuilder.factory.buildFramework({ id: 'frameworkId2', name: 'B' });
        databaseBuilder.factory.buildFramework({ id: 'frameworkId3', name: 'C' });
        databaseBuilder.factory.buildWhitelistedUrl({ id: 1, comment: 'Not in results' });

        await databaseBuilder.commit();

        // when
        const { entities, meta } = await listByEntityName(entityName, fields, pagination, sort);

        // then
        expect(entities).toEqual([
          {
            id: 'frameworkId1',
            name: 'A',
          },
          {
            id: 'frameworkId2',
            name: 'B',
          },
        ]);
        expect(meta).toEqual({
          page: 1,
          pageCount: 2,
          pageSize: pagination.size,
          rowCount: 3,
        });
      });
    });
  });
});
