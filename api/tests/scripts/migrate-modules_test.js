import { beforeEach, describe, expect, it, vi } from 'vitest';

import { domainBuilder, knex } from '../test-helper.js';
import { MigrateModules } from '../../scripts/migrate-modules.js';
import { logger } from '../../lib/infrastructure/logger.js';

describe('Script | MigrateModules', () => {
  /** @type {MigrateModules} */
  let script;
  let octokit;
  let modules;

  beforeEach(() => {
    script = new MigrateModules();

    const pixModuleFiles = [
      { path: 'api/src/devcomp/infrastructure/datasources/learning-content/modules/dernier-module.json' },
      { path: 'api/src/devcomp/infrastructure/datasources/learning-content/modules/deuxieme-module.json' },
      { path: 'api/src/devcomp/infrastructure/datasources/learning-content/modules/premier-module.json' },
      { path: 'api/src/devcomp/infrastructure/datasources/learning-content/modules/troisieme-module.json' },
    ];

    octokit = { repos: { getContent: vi.fn() } };

    octokit.repos.getContent.mockResolvedValueOnce({ data: pixModuleFiles });

    modules = [
      domainBuilder.buildModule({ shortId: 'derniera', title: 'dernier module' }),
      domainBuilder.buildModule({ shortId: 'deuxieme', title: 'deuxieme module' }),
      domainBuilder.buildModule({ shortId: 'premiera', title: 'premier module' }),
      domainBuilder.buildModule({ shortId: 'troisiem', title: 'troisieme module' }),
    ].map(({ internalTitle: _, ...module }) => module);

    modules.forEach((module) => {
      octokit.repos.getContent.mockResolvedValueOnce({ data: { type: 'file', encoding: 'utf8', content: JSON.stringify(module) } });
    });
  });

  describe('#handle', () => {
    it('fetches and inserts modules from Pix repository', async () => {
      // given
      const options = { dryRun: false };

      // when
      await script.handle({ options, logger }, { octokit });

      // then
      await expect(knex.select('id', 'shortId', 'title').from('modules').orderBy('shortId')).resolves.toStrictEqual(modules.map((module) => ({
        id: module.id,
        shortId: module.shortId,
        title: module.title,
      })));

      expect(octokit.repos.getContent).toHaveBeenCalledTimes(5);

      expect(octokit.repos.getContent).toHaveBeenNthCalledWith(1, { owner: '1024pix', repo: 'pix', ref: 'dev', path: 'api/src/devcomp/infrastructure/datasources/learning-content/modules/' });

      expect(octokit.repos.getContent).toHaveBeenNthCalledWith(2, { owner: '1024pix', repo: 'pix', ref: 'dev', path: 'api/src/devcomp/infrastructure/datasources/learning-content/modules/dernier-module.json' });
      expect(octokit.repos.getContent).toHaveBeenNthCalledWith(3, { owner: '1024pix', repo: 'pix', ref: 'dev', path: 'api/src/devcomp/infrastructure/datasources/learning-content/modules/deuxieme-module.json' });
      expect(octokit.repos.getContent).toHaveBeenNthCalledWith(4, { owner: '1024pix', repo: 'pix', ref: 'dev', path: 'api/src/devcomp/infrastructure/datasources/learning-content/modules/premier-module.json' });
      expect(octokit.repos.getContent).toHaveBeenNthCalledWith(5, { owner: '1024pix', repo: 'pix', ref: 'dev', path: 'api/src/devcomp/infrastructure/datasources/learning-content/modules/troisieme-module.json' });
    });
  });
});
