import { describe, expect, it } from 'vitest';
import { databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import * as draftModuleVersionRepository from '../../../../lib/infrastructure/repositories/draft-module-version-repository.js';
import { DraftModuleVersion } from '../../../../lib/domain/models/DraftModuleVersion.js';

describe('Draft Module Version Repository', () => {
  describe('create', () => {
    it('create a draft module version in database', async () => {
      // given
      const draftModule = domainBuilder.buildDraftModule();
      databaseBuilder.factory.buildDraftModule(draftModule);
      await databaseBuilder.commit();

      const draftModuleVersion = new DraftModuleVersion({
        draftModuleId: draftModule.id,
        version: draftModule.version,
        structuredDiff: { test: 'ceci est un diff structuré de test...' },
      });

      // when
      await draftModuleVersionRepository.create(draftModuleVersion);

      // then
      await expect(knex.select().from('draft-module-versions')).resolves.toStrictEqual([
        {
          id: expect.any(Number),
          draftModuleId: draftModule.id,
          version: draftModule.version,
          structuredDiff: { test: 'ceci est un diff structuré de test...' },
          createdAt: expect.any(Date),
        },
      ]);
    });
  });
});
