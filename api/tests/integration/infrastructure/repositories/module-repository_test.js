import { describe, expect, it } from 'vitest';
import { databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import { list, listForReplication, save } from '../../../../lib/infrastructure/repositories/module-repository.js';
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
});
