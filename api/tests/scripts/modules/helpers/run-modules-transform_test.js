import { describe, expect, it, vi } from 'vitest';

import { databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import { runModulesTransform } from '../../../../scripts/modules/helpers/run-modules-transform.js';
import { logger } from '../../../../lib/infrastructure/logger.js';

const CONTENT_TO_FIX = '<p>À corriger</p>';
const FIXED_CONTENT = '<p>Corrigé</p>';

describe('Acceptance | Scripts | Modules | Helpers | run-modules-transform', () => {
  it('saves the modules and draft modules updated by the transform', async () => {
    // given
    const moduleToFixWithoutDraft = domainBuilder.buildModule({
      shortId: 'module01',
      internalTitle: 'module-to-fix-without-draft',
      version: '1.0',
      sections: buildSectionsWithText(CONTENT_TO_FIX),
    });

    const moduleToFixWithDraftToFix = domainBuilder.buildModule({
      shortId: 'module02',
      internalTitle: 'module-to-fix-with-draft-to-fix',
      version: '1.0',
      sections: buildSectionsWithText(CONTENT_TO_FIX),
    });
    const draftToFixOfModuleToFix = domainBuilder.buildDraftModule({
      ...moduleToFixWithDraftToFix,
      moduleId: moduleToFixWithDraftToFix.id,
      version: '1.1',
      sections: buildSectionsWithText(CONTENT_TO_FIX),
    });

    const moduleToFixWithUpToDateDraft = domainBuilder.buildModule({
      shortId: 'module03',
      internalTitle: 'module-to-fix-with-up-to-date-draft',
      version: '1.0',
      sections: buildSectionsWithText(CONTENT_TO_FIX),
    });
    const upToDateDraftOfModuleToFix = domainBuilder.buildDraftModule({
      ...moduleToFixWithUpToDateDraft,
      moduleId: moduleToFixWithUpToDateDraft.id,
      version: '1.1',
      sections: buildSectionsWithText('<p>Brouillon à jour</p>'),
    });

    const upToDateModuleWithDraftToFix = domainBuilder.buildModule({
      shortId: 'module04',
      internalTitle: 'up-to-date-module-with-draft-to-fix',
      version: '1.0',
      sections: buildSectionsWithText('<p>Module à jour</p>'),
    });
    const draftToFixOfUpToDateModule = domainBuilder.buildDraftModule({
      ...upToDateModuleWithDraftToFix,
      moduleId: upToDateModuleWithDraftToFix.id,
      version: '1.1',
      sections: buildSectionsWithText(CONTENT_TO_FIX),
    });

    const upToDateModuleWithUpToDateDraft = domainBuilder.buildModule({
      shortId: 'module05',
      internalTitle: 'up-to-date-module-with-up-to-date-draft',
      version: '1.0',
      sections: buildSectionsWithText('<p>Module à jour</p>'),
    });
    const upToDateDraftOfUpToDateModule = domainBuilder.buildDraftModule({
      ...upToDateModuleWithUpToDateDraft,
      moduleId: upToDateModuleWithUpToDateDraft.id,
      version: '1.1',
      sections: buildSectionsWithText('<p>Brouillon à jour</p>'),
    });

    const creationDraftToFix = domainBuilder.buildDraftModule({
      shortId: 'draft001',
      internalTitle: 'creation-draft-to-fix',
      version: '0.1',
      sections: buildSectionsWithText(CONTENT_TO_FIX),
    });
    const upToDateCreationDraft = domainBuilder.buildDraftModule({
      shortId: 'draft002',
      internalTitle: 'up-to-date-creation-draft',
      version: '0.1',
      sections: buildSectionsWithText('<p>Brouillon à jour</p>'),
    });

    databaseBuilder.factory.buildModule(moduleToFixWithoutDraft);
    databaseBuilder.factory.buildModule(moduleToFixWithDraftToFix);
    databaseBuilder.factory.buildModule(moduleToFixWithUpToDateDraft);
    databaseBuilder.factory.buildModule(upToDateModuleWithDraftToFix);
    databaseBuilder.factory.buildModule(upToDateModuleWithUpToDateDraft);
    databaseBuilder.factory.buildDraftModule(draftToFixOfModuleToFix);
    databaseBuilder.factory.buildDraftModule(upToDateDraftOfModuleToFix);
    databaseBuilder.factory.buildDraftModule(draftToFixOfUpToDateModule);
    databaseBuilder.factory.buildDraftModule(upToDateDraftOfUpToDateModule);
    databaseBuilder.factory.buildDraftModule(creationDraftToFix);
    databaseBuilder.factory.buildDraftModule(upToDateCreationDraft);
    await databaseBuilder.commit();

    // when
    await runModulesTransform({ transform: fixTextContent, options: { dryRun: false }, logger });

    // then
    const textContent = knex.raw("sections #>> '{0,grains,0,components,0,element,content}' as content");

    const returnedModules = knex('modules').select('internalTitle', 'version', textContent).orderBy('shortId');
    const expectedModules = [
      { internalTitle: 'module-to-fix-without-draft', version: '2.0', content: FIXED_CONTENT },
      { internalTitle: 'module-to-fix-with-draft-to-fix', version: '2.0', content: FIXED_CONTENT },
      { internalTitle: 'module-to-fix-with-up-to-date-draft', version: '2.0', content: FIXED_CONTENT },
      { internalTitle: 'up-to-date-module-with-draft-to-fix', version: '1.0', content: '<p>Module à jour</p>' },
      { internalTitle: 'up-to-date-module-with-up-to-date-draft', version: '1.0', content: '<p>Module à jour</p>' },
    ];
    await expect(returnedModules).resolves.toStrictEqual(expectedModules);

    const returnedModuleVersions = knex('module-versions').select('internalTitle', 'version').orderBy('shortId');
    const expectedModuleVersions = [
      { internalTitle: 'module-to-fix-without-draft', version: '2.0' },
      { internalTitle: 'module-to-fix-with-draft-to-fix', version: '2.0' },
      { internalTitle: 'module-to-fix-with-up-to-date-draft', version: '2.0' },
    ];
    await expect(returnedModuleVersions).resolves.toStrictEqual(expectedModuleVersions);

    // A recreated draft starts again from its own sections, so an up-to-date draft keeps its content.
    const returnedDraftModules = knex('draft-modules').select('internalTitle', 'version', textContent).orderBy('shortId');
    const expectedDraftModules = [
      { internalTitle: 'creation-draft-to-fix', version: '0.2', content: FIXED_CONTENT },
      { internalTitle: 'up-to-date-creation-draft', version: '0.1', content: '<p>Brouillon à jour</p>' },
      { internalTitle: 'module-to-fix-with-draft-to-fix', version: '2.1', content: FIXED_CONTENT },
      { internalTitle: 'module-to-fix-with-up-to-date-draft', version: '2.1', content: '<p>Brouillon à jour</p>' },
      { internalTitle: 'up-to-date-module-with-draft-to-fix', version: '1.2', content: FIXED_CONTENT },
      { internalTitle: 'up-to-date-module-with-up-to-date-draft', version: '1.1', content: '<p>Brouillon à jour</p>' },
    ];
    await expect(returnedDraftModules).resolves.toStrictEqual(expectedDraftModules);

    const returnedDraftModuleVersions = knex('draft-module-versions')
      .join('draft-modules', 'draft-modules.id', 'draft-module-versions.draftModuleId')
      .select('internalTitle', 'draft-module-versions.version')
      .orderBy('shortId');
    const expectedDraftModuleVersions = [
      { internalTitle: 'creation-draft-to-fix', version: '0.2' },
      { internalTitle: 'module-to-fix-with-draft-to-fix', version: '2.1' },
      { internalTitle: 'module-to-fix-with-up-to-date-draft', version: '2.1' },
      { internalTitle: 'up-to-date-module-with-draft-to-fix', version: '1.2' },
    ];
    await expect(returnedDraftModuleVersions).resolves.toStrictEqual(expectedDraftModuleVersions);
  });

  it('logs what would be updated and does not update anything in dry run mode', async () => {
    // given
    const module = domainBuilder.buildModule({
      internalTitle: 'module-to-fix',
      version: '1.0',
      sections: buildSectionsWithText(CONTENT_TO_FIX),
    });
    const draftOfModule = domainBuilder.buildDraftModule({ ...module, version: '1.1', moduleId: module.id });

    databaseBuilder.factory.buildModule(module);
    databaseBuilder.factory.buildDraftModule(draftOfModule);
    await databaseBuilder.commit();

    const spiedLogger = { info: vi.fn(), error: vi.fn() };

    // when
    await runModulesTransform({ transform: fixTextContent, options: { dryRun: true }, logger: spiedLogger });

    // then
    const expectedInfoLogs = [
      [{ dryRun: true }, 'Script options'],
      [{ id: module.id, internalTitle: 'module-to-fix', version: '1.0', numberOfEditedObjects: 1 }, 'Module to update'],
      ['1 module(s) to update, 1 object(s) to complete'],
      [{ id: draftOfModule.id, internalTitle: 'module-to-fix', version: '1.1', numberOfEditedObjects: 1, willBeRecreated: true }, 'Draft module to update'],
      ['1 draft module(s) to update (1 recreated because their module is updated), 1 object(s) to complete'],
      ['Dry run: nothing saved. Re-run with --dryRun=false to apply changes.'],
    ];
    expect(spiedLogger.info.mock.calls).toStrictEqual(expectedInfoLogs);
    expect(spiedLogger.error).not.toHaveBeenCalled();

    await expect(knex('modules').select('version', 'sections')).resolves.toStrictEqual([{ version: '1.0', sections: module.sections }]);
    await expect(knex('draft-modules').select('version', 'sections')).resolves.toStrictEqual([{ version: '1.1', sections: draftOfModule.sections }]);
    await expect(knex('module-versions').count().first()).resolves.toStrictEqual({ count: 0 });
    await expect(knex('draft-module-versions').count().first()).resolves.toStrictEqual({ count: 0 });
  });

  it('logs that there is nothing to update when the transform edits nothing', async () => {
    // given
    const module = domainBuilder.buildModule({ version: '1.0', sections: buildSectionsWithText('<p>Module à jour</p>') });
    databaseBuilder.factory.buildModule(module);
    await databaseBuilder.commit();

    const spiedLogger = { info: vi.fn(), error: vi.fn() };

    // when
    await runModulesTransform({ transform: fixTextContent, options: { dryRun: false }, logger: spiedLogger });

    // then
    expect(spiedLogger.info).toHaveBeenLastCalledWith('Nothing to update');
    await expect(knex('module-versions').count().first()).resolves.toStrictEqual({ count: 0 });
  });

  describe('when validation of an updated module fails', () => {
    it('logs the errors and stops without saving anything', async () => {
      // given
      const notValidModule = domainBuilder.buildModule({
        internalTitle: 'not-valid-module',
        details: { objectives: [] },
        version: '1.0',
        sections: buildSectionsWithText(CONTENT_TO_FIX),
      });

      databaseBuilder.factory.buildModule(notValidModule);
      await databaseBuilder.commit();

      const spiedLogger = { info: vi.fn(), error: vi.fn() };

      // when
      const execution = runModulesTransform({ transform: fixTextContent, options: { dryRun: false }, logger: spiedLogger });

      // then
      await expect(execution).rejects.toThrow('Modules validation failed.');

      const expectedSummaryLog = [`1 modules validation failed : ${notValidModule.id}`];
      const expectedDetailLog = [`Errors in module ${notValidModule.id}: {"message":"\\"details.objectives\\" doit contenir au moins 1 élément(s)","isSchemaError":true}`];
      expect(spiedLogger.error.mock.calls).toStrictEqual([expectedSummaryLog, expectedDetailLog]);

      await expect(knex('modules').select('version', 'sections')).resolves.toStrictEqual([{ version: '1.0', sections: notValidModule.sections }]);
    });
  });
});

// Test transform: replaces CONTENT_TO_FIX by FIXED_CONTENT in the text element of the first grain.
function fixTextContent({ sections }) {
  const clonedSections = structuredClone(sections);
  const textElement = clonedSections[0].grains[0].components[0].element;

  if (textElement.content !== CONTENT_TO_FIX) {
    return { sections: clonedSections, numberOfEditedObjects: 0 };
  }

  textElement.content = FIXED_CONTENT;
  return { sections: clonedSections, numberOfEditedObjects: 1 };
}

function buildSectionsWithText(content) {
  return [
    {
      id: crypto.randomUUID(),
      type: 'question-yourself',
      grains: [
        {
          id: crypto.randomUUID(),
          type: 'challenge',
          title: 'Grain',
          components: [{ type: 'element', element: { id: crypto.randomUUID(), type: 'text', tag: ' ', content } }],
        },
      ],
    },
  ];
}
