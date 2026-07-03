import { describe, expect, it } from 'vitest';
import { catchErr, databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import * as draftModuleRepository from '../../../../lib/infrastructure/repositories/draft-module-repository.js';
import { NotFoundError } from '../../../../lib/infrastructure/errors.js';

describe('Draft Module Repository', () => {
  describe('save', () => {
    it('saves a draft module having a NULL moduleId ', async () => {
      // given
      const draftModule = domainBuilder.buildDraftModule();
      const expectedDraftModule = { ...draftModule, createdAt: expect.any(Date), updatedAt: expect.any(Date) };

      // when
      const savedDraftModule = await draftModuleRepository.save({ ...draftModule });

      // then
      const { details: expectedDetails, ...expectedDraftModuleData } = expectedDraftModule;
      await expect(knex.select().from('draft-modules')).resolves.toStrictEqual([{ ...expectedDraftModuleData, ...expectedDetails }]);
      expect({ ...savedDraftModule }).toStrictEqual(expectedDraftModule);
    });

    it('saves a draft module referencing an existing module', async () => {
      // given
      const module = domainBuilder.buildModule();
      databaseBuilder.factory.buildModule(module);

      const expectedDraftModule = domainBuilder.buildDraftModule({ ...module, moduleId: module.id, createdAt: expect.any(Date), updatedAt: expect.any(Date) });

      await databaseBuilder.commit();

      // when
      const savedDraftModule = await draftModuleRepository.save({ ...module, moduleId: module.id });

      // then
      const { details: expectedDetails, ...expectedDraftModuleData } = expectedDraftModule;
      await expect(knex.select().from('draft-modules')).resolves.toStrictEqual([{ ...expectedDraftModuleData, ...expectedDetails }]);
      expect(savedDraftModule).toStrictEqual(expectedDraftModule);
    });

    it('overrides draft module when it already exists', async () => {
      // given
      const module = domainBuilder.buildModule();
      databaseBuilder.factory.buildModule(module);

      const updatedModule = {
        ...module,
        title: 'updated',
      };
      const expectedDraftModule = domainBuilder.buildDraftModule({
        ...updatedModule,
        moduleId: module.id,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      await databaseBuilder.commit();

      // when
      const savedDraftModule = await draftModuleRepository.save({ ...updatedModule, moduleId: module.id });

      // then
      const { details: expectedDetails, ...expectedDraftModuleData } = expectedDraftModule;
      await expect(knex.select().from('draft-modules')).resolves.toStrictEqual([{ ...expectedDraftModuleData, ...expectedDetails }]);
      expect(savedDraftModule).toStrictEqual(expectedDraftModule);
    });
  });

  describe('list', () => {
    it('lists all draft modules', async () => {
      // given
      const firstDraftModule = domainBuilder.buildDraftModule({ slug: 'a' });
      const secondDraftModule = domainBuilder.buildDraftModule({ shortId: 'secondar', internalTitle: 'secondar', slug: 'b' });

      databaseBuilder.factory.buildDraftModule(firstDraftModule);
      databaseBuilder.factory.buildDraftModule(secondDraftModule);

      await databaseBuilder.commit();

      // when
      const draftModules = await draftModuleRepository.list();

      // then
      expect(draftModules).toStrictEqual([firstDraftModule, secondDraftModule]);
    });

    it('lists draft modules with pagination and sort parameters', async () => {
      // given
      const firstDraftModule = domainBuilder.buildDraftModule({ shortId: 'first', internalTitle: 'first', slug: 'c', title: 'DraftModule A', visibility: 'public' });
      const secondDraftModule = domainBuilder.buildDraftModule({ shortId: 'secondar', internalTitle: 'secondar', slug: 'b', title: 'DraftModule B', visibility: 'private' });
      const thirdDraftModule = domainBuilder.buildDraftModule({ shortId: 'terzio', internalTitle: 'terzio', slug: 'a', title: 'DraftModule C', visibility: 'public' });
      const page = {
        size: 2,
        number: 1,
      };
      const sort = [['visibility', 'desc'], ['title', 'asc']];

      databaseBuilder.factory.buildDraftModule(firstDraftModule);
      databaseBuilder.factory.buildDraftModule(secondDraftModule);
      databaseBuilder.factory.buildDraftModule(thirdDraftModule);

      await databaseBuilder.commit();

      // when
      const draftModules = await draftModuleRepository.list({ page, sort });

      // then
      expect(draftModules).toStrictEqual([firstDraftModule, thirdDraftModule]);
    });
  });

  describe('count', () => {
    it('returns number of draft-modules', async () => {
      // given
      databaseBuilder.factory.buildDraftModule(domainBuilder.buildDraftModule());
      databaseBuilder.factory.buildDraftModule(domainBuilder.buildDraftModule({ shortId: 'secondar', internalTitle: 'secondar' }));
      await databaseBuilder.commit();

      // when
      const result = await draftModuleRepository.count();

      // then
      expect(result).toBe(2);
    });
  });

  describe('getById', () => {
    it('returns a draft module by its id', async () => {
      // given
      const module = domainBuilder.buildModule();
      databaseBuilder.factory.buildModule(module);
      const expectedDraftModule = domainBuilder.buildDraftModule({ id: module.id, shortId: module.shortId, moduleId: module.id });
      databaseBuilder.factory.buildDraftModule(expectedDraftModule);
      databaseBuilder.factory.buildDraftModule(domainBuilder.buildDraftModule({ shortId: 'secondar', internalTitle: 'secondar' }));
      await databaseBuilder.commit();

      // when
      const draftModule = await draftModuleRepository.getById({ id: expectedDraftModule.id });

      // then
      expect(draftModule).toStrictEqual(expectedDraftModule);
    });

    it('throw a not Found error if draft module is not found', async () => {
      // given
      const inexistingDraftModuleId = crypto.randomUUID();

      // when
      const error = await catchErr(draftModuleRepository.getById)({ id: inexistingDraftModuleId });

      // then
      expect(error).toBeInstanceOf(NotFoundError);
    });
  });

  describe('remove', () => {
    it('removes draft module by id', async () => {
      // given
      const { id } = databaseBuilder.factory.buildDraftModule(domainBuilder.buildDraftModule({ shortId: 'modtest1', internalTitle: 'MOD_test1', slug: 'test1' }));
      databaseBuilder.factory.buildDraftModule(domainBuilder.buildDraftModule({ shortId: 'modtest2', internalTitle: 'MOD_test2', slug: 'test2' }));
      await databaseBuilder.commit();

      // when
      await draftModuleRepository.remove({ id });

      // then
      expect(knex.pluck('shortId').from('draft-modules')).resolves.toStrictEqual(['modtest2']);
    });
  });
});
