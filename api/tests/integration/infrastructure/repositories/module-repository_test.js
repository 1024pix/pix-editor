import { describe, expect, it } from 'vitest';
import { databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import { list, listForReplication, save, count } from '../../../../lib/infrastructure/repositories/module-repository.js';
import { ModuleForReplication } from '../../../../lib/domain/models/replication/index.js';

describe('Module Repository', () => {
  describe('save', () => {
    it('saves a module', async () => {
      // given
      const module = domainBuilder.buildModule();

      // when
      await save(module);

      // then
      const { details, ...moduleData } = module;
      await expect(knex.select().from('modules')).resolves.toStrictEqual([{ ...details, ...moduleData }]);
    });

    it('updates a module', async () => {
      // given
      const module = domainBuilder.buildModule();
      databaseBuilder.factory.buildModule(module);
      await databaseBuilder.commit();

      const moduleWithUpdate = domainBuilder.buildModule({
        id: module.id,
        shortId: module.shortId,
        title: 'apprendre à être mou ou molle',
        details: { ...module.details, description: "<p>Ce module est dédié aux escargots, mâle et femelle</p><p>Il contient normalement l'intégralité de leurs secrets disponibles à date (août 2025).</p>" },
      });

      // when
      await save(moduleWithUpdate);

      // then
      const { details, ...moduleData } = moduleWithUpdate;
      await expect(knex.select().from('modules')).resolves.toStrictEqual([{ ...details, ...moduleData, updatedAt: expect.any(Date) }]);
    });
  });

  describe('list', () => {
    it('lists all modules', async () => {
      // given
      const firstModule = domainBuilder.buildModule({ slug: 'a' });
      const secondModule = domainBuilder.buildModule({ shortId: 'secondar', slug: 'b' });

      databaseBuilder.factory.buildModule(firstModule);
      databaseBuilder.factory.buildModule(secondModule);

      await databaseBuilder.commit();

      // when
      const modules = await list();

      // then
      expect(modules).toStrictEqual([firstModule, secondModule]);
    });

    it('lists modules with pagination and sort parameters', async () => {
      // given
      const firstModule = domainBuilder.buildModule({ shortId: 'first', slug: 'c', title: 'Module A', visibility: 'public' });
      const secondModule = domainBuilder.buildModule({ shortId: 'secondar', slug: 'b', title: 'Module B', visibility: 'private' });
      const thirdModule = domainBuilder.buildModule({ shortId: 'terzio', slug: 'a', title: 'Module C', visibility: 'public' });
      const page = {
        size: 2,
        number: 1,
      };
      const sort = [['visibility', 'desc'], ['title', 'asc']];

      databaseBuilder.factory.buildModule(firstModule);
      databaseBuilder.factory.buildModule(secondModule);
      databaseBuilder.factory.buildModule(thirdModule);

      await databaseBuilder.commit();

      // when
      const modules = await list({ page, sort });

      // then
      expect(modules).toStrictEqual([firstModule, thirdModule]);
    });
  });

  describe('listForReplication', () => {
    it('lists all modules for replication', async () => {
      // given
      const firstModule = domainBuilder.buildModule({ slug: 'a' });
      const secondModule = domainBuilder.buildModule({ shortId: 'secondar', slug: 'b' });

      databaseBuilder.factory.buildModule(firstModule);
      databaseBuilder.factory.buildModule(secondModule);
      await databaseBuilder.commit();

      const expectedModules = [firstModule, secondModule].map(({ details, ...module }) => new ModuleForReplication({ ...module, ...details }));

      // when
      const modules = await listForReplication();

      // then
      expect(modules).toStrictEqual(expectedModules);
    });
  });

  describe('count', () => {
    it('returns number of modules', async () => {
      // given
      databaseBuilder.factory.buildModule(domainBuilder.buildModule());
      databaseBuilder.factory.buildModule(domainBuilder.buildModule({ shortId: 'secondar' }));
      await databaseBuilder.commit();

      // when
      const result = await count();

      // then
      expect(result).toBe(2);
    });
  });
});
