import { describe, expect, it } from 'vitest';
import { bulkUpdateModules } from '../../../../lib/domain/usecases/index.js';
import { ModuleVersion } from '../../../../lib/domain/models/index.js';
import { moduleRepository, moduleVersionRepository } from '../../../../lib/infrastructure/repositories/index.js';
import { databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';

describe('Integration | Usecases | Bulk update modules', () => {
  it('saves modules with an incremented major version and creates their module versions', async () => {
    // given
    const module1 = databaseBuilder.factory.buildModule(domainBuilder.buildModule({ shortId: 'module01', internalTitle: 'module-1', version: '1.0' }));
    const module2 = databaseBuilder.factory.buildModule(domainBuilder.buildModule({ shortId: 'module02', internalTitle: 'module-2', version: '2.0' }));
    await databaseBuilder.commit();

    const modules = await moduleRepository.list();
    modules[0].title = 'Nouveau titre';

    // when
    await bulkUpdateModules(modules);

    // then
    await expect(knex('modules').select('id', 'title', 'version').orderBy('shortId')).resolves.toStrictEqual([{ id: module1.id, title: 'Nouveau titre', version: '2.0' }, { id: module2.id, title: module2.title, version: '3.0' }]);
    await expect(knex('module-versions').select('moduleId', 'title', 'version').orderBy('version')).resolves.toStrictEqual([{ moduleId: module1.id, title: 'Nouveau titre', version: '2.0' }, { moduleId: module2.id, title: module2.title, version: '3.0' }]);
  });

  it('does not save anything when an update fails', async () => {
    // given
    const module1 = databaseBuilder.factory.buildModule(domainBuilder.buildModule({ shortId: 'module01', internalTitle: 'module-1', version: '1.0' }));
    const module2 = databaseBuilder.factory.buildModule(domainBuilder.buildModule({ shortId: 'module02', internalTitle: 'module-2', version: '1.0' }));
    await databaseBuilder.commit();

    const modules = await moduleRepository.list();
    await moduleVersionRepository.create(ModuleVersion.fromModule({ ...modules[1], version: '2.0' }));

    // when
    const promise = bulkUpdateModules(modules);

    // then
    await expect(promise).rejects.toThrow('module_versions_moduleid_version_unique');
    await expect(knex('modules').select('id', 'version').orderBy('shortId')).resolves.toStrictEqual([{ id: module1.id, version: '1.0' }, { id: module2.id, version: '1.0' }]);
    await expect(knex('module-versions').select('moduleId', 'version')).resolves.toStrictEqual([{ moduleId: module2.id, version: '2.0' }]);
  });
});
