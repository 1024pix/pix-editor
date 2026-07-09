import { describe, expect, it } from 'vitest';
import { catchErr, databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import { list, listForReplication, save, count, getById } from '../../../../lib/infrastructure/repositories/module-repository.js';
import { ModuleForReplication } from '../../../../lib/domain/models/replication/index.js';
import { NotFoundError } from '../../../../lib/infrastructure/errors.js';

describe('Module Repository', () => {
  describe('save', () => {
    it('saves a module', async () => {
      // given
      const module = domainBuilder.buildModule();
      module.createdAt = undefined;
      module.updatedAt = undefined;
      const expectedModule = domainBuilder.buildModule({
        ...module,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      // when
      const savedModule = await save(module);

      // then
      const { details: expectedDetails, ...expectedModuleData } = expectedModule;
      await expect(knex.select().from('modules')).resolves.toStrictEqual([{ ...expectedModuleData, ...expectedDetails }]);
      expect(savedModule).toStrictEqual(expectedModule);
    });

    it('updates a module', async () => {
      // given
      const module = domainBuilder.buildModule();
      databaseBuilder.factory.buildModule(module);
      await databaseBuilder.commit();

      const moduleWithUpdate = domainBuilder.buildModule({
        ...module,
        title: 'apprendre à être mou ou molle',
        details: {
          ...module.details,
          description: "<p>Ce module est dédié aux escargots, mâle et femelle</p><p>Il contient normalement l'intégralité de leurs secrets disponibles à date (août 2025).</p>",
        },
      });

      const expectedModule = domainBuilder.buildModule({
        ...moduleWithUpdate,
        updatedAt: expect.any(Date),
      });

      // when
      const savedModule = await save(moduleWithUpdate);

      // then
      const { details: expectedDetails, ...expectedModuleData } = expectedModule;
      await expect(knex.select().from('modules')).resolves.toStrictEqual([{ ...expectedModuleData, ...expectedDetails }]);
      expect(savedModule).toStrictEqual(expectedModule);
    });
  });

  describe('list', () => {
    it('lists all modules', async () => {
      // given
      const firstModule = domainBuilder.buildModule({ slug: 'a' });
      const secondModule = domainBuilder.buildModule({ shortId: 'secondar', internalTitle: 'secondar', slug: 'b' });

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
      const firstModule = domainBuilder.buildModule({ shortId: 'first', internalTitle: 'first', slug: 'c', title: 'Module A', visibility: 'public' });
      const secondModule = domainBuilder.buildModule({ shortId: 'secondar', internalTitle: 'secondar', slug: 'b', title: 'Module B', visibility: 'private' });
      const thirdModule = domainBuilder.buildModule({ shortId: 'terzio', internalTitle: 'terzio', slug: 'a', title: 'Module C', visibility: 'public' });
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
      const secondModule = domainBuilder.buildModule({ shortId: 'secondar', internalTitle: 'secondar', slug: 'b' });

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
      databaseBuilder.factory.buildModule(domainBuilder.buildModule({ shortId: 'secondar', internalTitle: 'secondar' }));
      await databaseBuilder.commit();

      // when
      const result = await count();

      // then
      expect(result).toBe(2);
    });
  });

  describe('getById', () => {
    it('returns a module by its id', async () => {
      // given
      const id = crypto.randomUUID();
      const expectedModule = domainBuilder.buildModule({ id });
      const expectedModuleForConsultation = domainBuilder.buildModuleForConsultation({ ...expectedModule, draftModuleId: id });
      databaseBuilder.factory.buildModule(expectedModuleForConsultation);
      databaseBuilder.factory.buildDraftModule(domainBuilder.buildDraftModule({ id, moduleId: id }));
      databaseBuilder.factory.buildModule(domainBuilder.buildModule({ shortId: 'secondar', internalTitle: 'secondar' }));
      await databaseBuilder.commit();

      // when
      const module = await getById({ id });

      // then
      expect(module).toStrictEqual(expectedModuleForConsultation);
    });

    it('throw a not Found error if module is not found', async () => {
      // given
      const inexistingModuleId = crypto.randomUUID();

      // when
      const error = await catchErr(getById)({ id: inexistingModuleId });

      // then
      expect(error).toBeInstanceOf(NotFoundError);
    });
  });
});
