import { describe, describe as context, expect, it } from 'vitest';
import { catchErr, databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import * as draftModuleRepository from '../../../../lib/infrastructure/repositories/draft-module-repository.js';
import { NotFoundError } from '../../../../lib/infrastructure/errors.js';

describe('Integration | Repository | draft-module-repository', () => {
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

  describe('updateValidationStatus', () => {
    it('should update an existing draft module with validation status', async () => {
      // given
      const module = domainBuilder.buildDraftModule();
      const { id } = databaseBuilder.factory.buildDraftModule(module);
      const hasBeenValidated = false;
      const validationErrors = [
        `\nError: "id" must be a valid GUID.
      Valeur concernée à rechercher : "f7b3a2-1a3d8f7e9f5d"\n`,
        `\nError: "grains[5].id" must be a valid GUID.
      Valeur concernée à rechercher : "b7ea7630-824"\n`,
      ];

      await databaseBuilder.commit();

      // when
      await draftModuleRepository.updateValidationStatus({ id, hasBeenValidated, validationErrors });

      // then
      const draftModule = await draftModuleRepository.getById({ id });
      expect(draftModule.hasBeenValidated).toEqual(hasBeenValidated);
      expect(draftModule.validationErrors).to.deep.equal(validationErrors);
    });

    context('when an existing draft module already has validation errors', function() {
      it('should update the corresponding fields correctly', async () => {
        const hasBeenValidated = false;
        const validationErrors = [
          `\nError: "id" must be a valid GUID.
      Valeur concernée à rechercher : "f7b3a2-1a3d8f7e9f5d"\n`,
          `\nError: "grains[5].id" must be a valid GUID.
      Valeur concernée à rechercher : "b7ea7630-824"\n`,
        ];

        const module = domainBuilder.buildDraftModule({ hasBeenValidated, validationErrors });
        const { id } = databaseBuilder.factory.buildDraftModule(module);

        await databaseBuilder.commit();

        // when
        await draftModuleRepository.updateValidationStatus({ id, hasBeenValidated: true, validationErrors: [] });

        // then
        const draftModule = await draftModuleRepository.getById({ id });
        expect(draftModule.hasBeenValidated).to.be.true;
        expect(draftModule.validationErrors).to.deep.equal([]);
      });
    });

    context('when draft module to update does not exist', function() {
      it('should thro', async () => {
        const hasBeenValidated = false;
        const validationErrors = [
          `\nError: "id" must be a valid GUID.
      Valeur concernée à rechercher : "f7b3a2-1a3d8f7e9f5d"\n`,
          `\nError: "grains[5].id" must be a valid GUID.
      Valeur concernée à rechercher : "b7ea7630-824"\n`,
        ];

        const module = domainBuilder.buildDraftModule({ hasBeenValidated, validationErrors });
        const { id } = databaseBuilder.factory.buildDraftModule(module);

        await databaseBuilder.commit();

        // when
        await draftModuleRepository.updateValidationStatus({ id, hasBeenValidated: true, validationErrors: [] });

        // then
        const draftModule = await draftModuleRepository.getById({ id });
        expect(draftModule.hasBeenValidated).to.be.true;
        expect(draftModule.validationErrors).to.deep.equal([]);
      });
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
      await expect(knex.pluck('shortId').from('draft-modules')).resolves.toStrictEqual(['modtest2']);
    });
  });
});
