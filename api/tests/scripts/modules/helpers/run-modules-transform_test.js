import { describe, expect, it, vi } from 'vitest';

import { databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import { runModulesTransform } from '../../../../scripts/modules/helpers/run-modules-transform.js';
import { logger } from '../../../../lib/infrastructure/logger.js';
import { User } from '../../../../lib/domain/models/index.js';

const CONTENT_TO_FIX = '<p>À corriger</p>';
const FIXED_CONTENT = '<p>Corrigé</p>';

describe('Acceptance | Scripts | Modules | Helpers | run-modules-transform', () => {
  it('saves the modules and draft modules updated by the transform', async () => {
    // given
    const previousUser = databaseBuilder.factory.buildAdminUser();

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

    const moduleToFixWithOutOfScopeDraft = domainBuilder.buildModule({
      shortId: 'module03',
      internalTitle: 'module-to-fix-with-out-of-scope-draft',
      version: '1.0',
      sections: buildSectionsWithText(CONTENT_TO_FIX),
    });
    const outOfScopeDraftOfModuleToFix = domainBuilder.buildDraftModule({
      ...moduleToFixWithOutOfScopeDraft,
      moduleId: moduleToFixWithOutOfScopeDraft.id,
      version: '1.1',
      modifiedBy: previousUser.id,
      sections: buildSectionsWithText('<p>Brouillon à jour</p>'),
    });

    const outOfScopeModuleWithDraftToFix = domainBuilder.buildModule({
      shortId: 'module04',
      internalTitle: 'out-of-scope-module-with-draft-to-fix',
      version: '1.0',
      sections: buildSectionsWithText('<p>Module à jour</p>'),
    });
    const draftToFixOfOutOfScopeModule = domainBuilder.buildDraftModule({
      ...outOfScopeModuleWithDraftToFix,
      moduleId: outOfScopeModuleWithDraftToFix.id,
      version: '1.1',
      sections: buildSectionsWithText(CONTENT_TO_FIX),
    });

    const outOfScopeModuleWithOutOfScopeDraft = domainBuilder.buildModule({
      shortId: 'module05',
      internalTitle: 'out-of-scope-module-with-out-of-scope-draft',
      version: '1.0',
      sections: buildSectionsWithText('<p>Module à jour</p>'),
    });
    const outOfScopeDraftOfOutOfScopeModule = domainBuilder.buildDraftModule({
      ...outOfScopeModuleWithOutOfScopeDraft,
      moduleId: outOfScopeModuleWithOutOfScopeDraft.id,
      version: '1.1',
      modifiedBy: previousUser.id,
      sections: buildSectionsWithText('<p>Brouillon à jour</p>'),
    });

    const creationDraftToFix = domainBuilder.buildDraftModule({
      shortId: 'draft001',
      internalTitle: 'creation-draft-to-fix',
      version: '0.1',
      sections: buildSectionsWithText(CONTENT_TO_FIX),
    });
    const outOfScopeCreationDraft = domainBuilder.buildDraftModule({
      shortId: 'draft002',
      internalTitle: 'out-of-scope-creation-draft',
      version: '0.1',
      modifiedBy: previousUser.id,
      sections: buildSectionsWithText('<p>Brouillon à jour</p>'),
    });

    const uuid = crypto.randomUUID();
    const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN, trigram: 'BOT', apiKey: uuid });

    databaseBuilder.factory.buildUser(user);
    databaseBuilder.factory.buildModule(moduleToFixWithoutDraft);
    databaseBuilder.factory.buildModule(moduleToFixWithDraftToFix);
    databaseBuilder.factory.buildModule(moduleToFixWithOutOfScopeDraft);
    databaseBuilder.factory.buildModule(outOfScopeModuleWithDraftToFix);
    databaseBuilder.factory.buildModule(outOfScopeModuleWithOutOfScopeDraft);
    databaseBuilder.factory.buildDraftModule(draftToFixOfModuleToFix);
    databaseBuilder.factory.buildDraftModule(outOfScopeDraftOfModuleToFix);
    databaseBuilder.factory.buildDraftModule(draftToFixOfOutOfScopeModule);
    databaseBuilder.factory.buildDraftModule(outOfScopeDraftOfOutOfScopeModule);
    databaseBuilder.factory.buildDraftModule(creationDraftToFix);
    databaseBuilder.factory.buildDraftModule(outOfScopeCreationDraft);
    await databaseBuilder.commit();

    // when
    await runModulesTransform({ transform: fixTextContent, options: { dryRun: false, userId: user.id }, logger });

    // then
    const textContent = knex.raw("sections #>> '{0,grains,0,components,0,element,content}' as content");

    const updatedModules = await knex('modules').select('internalTitle', 'version', textContent).orderBy('shortId');
    const expectedModules = [
      { internalTitle: 'module-to-fix-without-draft', version: '2.0', content: FIXED_CONTENT },
      { internalTitle: 'module-to-fix-with-draft-to-fix', version: '2.0', content: FIXED_CONTENT },
      { internalTitle: 'module-to-fix-with-out-of-scope-draft', version: '2.0', content: FIXED_CONTENT },
      { internalTitle: 'out-of-scope-module-with-draft-to-fix', version: '1.0', content: '<p>Module à jour</p>' },
      { internalTitle: 'out-of-scope-module-with-out-of-scope-draft', version: '1.0', content: '<p>Module à jour</p>' },
    ];
    expect(updatedModules).toStrictEqual(expectedModules);

    const updatedModuleVersions = await knex('module-versions').select('internalTitle', 'version').orderBy('shortId');
    const expectedModuleVersions = [
      { internalTitle: 'module-to-fix-without-draft', version: '2.0' },
      { internalTitle: 'module-to-fix-with-draft-to-fix', version: '2.0' },
      { internalTitle: 'module-to-fix-with-out-of-scope-draft', version: '2.0' },
    ];
    expect(updatedModuleVersions).toStrictEqual(expectedModuleVersions);

    // A recreated draft starts again from its own sections, so an out-of-scope draft keeps its content.
    const updatedDraftModules = await knex('draft-modules').select('internalTitle', 'version', textContent, 'modifiedBy').orderBy('shortId');
    const expectedDraftModules = [
      { internalTitle: 'creation-draft-to-fix', version: '0.2', content: FIXED_CONTENT, modifiedBy: user.id },
      { internalTitle: 'out-of-scope-creation-draft', version: '0.1', content: '<p>Brouillon à jour</p>', modifiedBy: previousUser.id },
      { internalTitle: 'module-to-fix-with-draft-to-fix', version: '2.1', content: FIXED_CONTENT, modifiedBy: user.id },
      { internalTitle: 'module-to-fix-with-out-of-scope-draft', version: '2.1', content: '<p>Brouillon à jour</p>', modifiedBy: user.id },
      { internalTitle: 'out-of-scope-module-with-draft-to-fix', version: '1.2', content: FIXED_CONTENT, modifiedBy: user.id },
      { internalTitle: 'out-of-scope-module-with-out-of-scope-draft', version: '1.1', content: '<p>Brouillon à jour</p>', modifiedBy: previousUser.id },
    ];
    expect(updatedDraftModules).toStrictEqual(expectedDraftModules);

    const updatedDraftModuleVersions = await knex('draft-module-versions')
      .join('draft-modules', 'draft-modules.id', 'draft-module-versions.draftModuleId')
      .select('internalTitle', 'draft-module-versions.version')
      .orderBy('shortId');
    const expectedDraftModuleVersions = [
      { internalTitle: 'creation-draft-to-fix', version: '0.2' },
      { internalTitle: 'module-to-fix-with-draft-to-fix', version: '2.1' },
      { internalTitle: 'module-to-fix-with-out-of-scope-draft', version: '2.1' },
      { internalTitle: 'out-of-scope-module-with-draft-to-fix', version: '1.2' },
    ];
    expect(updatedDraftModuleVersions).toStrictEqual(expectedDraftModuleVersions);
  });

  describe('in dry run mode', () => {
    it('logs what would be updated and does not update anything', async () => {
      // given
      const module = domainBuilder.buildModule({
        internalTitle: 'module-to-fix',
        version: '1.0',
        sections: buildSectionsWithText(CONTENT_TO_FIX),
      });
      const draftOfModule = domainBuilder.buildDraftModule({ ...module, version: '1.1', moduleId: module.id });
      const uuid = crypto.randomUUID();
      const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN, trigram: 'BOT', apiKey: uuid });

      databaseBuilder.factory.buildUser(user);
      databaseBuilder.factory.buildModule(module);
      databaseBuilder.factory.buildDraftModule(draftOfModule);
      await databaseBuilder.commit();

      const spiedLogger = { info: vi.fn(), error: vi.fn() };

      // when
      await runModulesTransform({ transform: fixTextContent, options: { dryRun: true, userId: user.id }, logger: spiedLogger });

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

      const unchangedModules = await knex('modules').select('version', 'sections');
      const expectedModules = [{ version: '1.0', sections: module.sections }];
      expect(unchangedModules).toStrictEqual(expectedModules);

      const unchangedDraftModules = await knex('draft-modules').select('version', 'sections');
      const expectedDraftModules = [{ version: '1.1', sections: draftOfModule.sections }];
      expect(unchangedDraftModules).toStrictEqual(expectedDraftModules);

      const unchangedModuleVersionsCount = await knex('module-versions').count().first();
      expect(unchangedModuleVersionsCount).toStrictEqual({ count: 0 });

      const unchangedDraftModuleVersionsCount = await knex('draft-module-versions').count().first();
      expect(unchangedDraftModuleVersionsCount).toStrictEqual({ count: 0 });
    });
  });

  describe('when the transform edits nothing', () => {
    it('logs that there is nothing to update and does nothing', async () => {
      // given
      const module = domainBuilder.buildModule({ version: '1.0', sections: buildSectionsWithText('<p>Module à jour</p>') });
      const uuid = crypto.randomUUID();
      const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN, trigram: 'BOT', apiKey: uuid });

      databaseBuilder.factory.buildUser(user);
      databaseBuilder.factory.buildModule(module);
      await databaseBuilder.commit();

      const spiedLogger = { info: vi.fn(), error: vi.fn() };

      // when
      await runModulesTransform({ transform: fixTextContent, options: { dryRun: false, userId: user.id }, logger: spiedLogger });

      // then
      expect(spiedLogger.info).toHaveBeenLastCalledWith('Nothing to update');

      const unchangedModuleVersionsCount = await knex('module-versions').count().first();
      expect(unchangedModuleVersionsCount).toStrictEqual({ count: 0 });
    });
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
      const uuid = crypto.randomUUID();
      const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN, trigram: 'BOT', apiKey: uuid });

      databaseBuilder.factory.buildUser(user);
      databaseBuilder.factory.buildModule(notValidModule);
      await databaseBuilder.commit();

      const spiedLogger = { info: vi.fn(), error: vi.fn() };

      // when
      const execution = runModulesTransform({ transform: fixTextContent, options: { dryRun: false, userId: user.id }, logger: spiedLogger });

      // then
      await expect(execution).rejects.toThrow('Modules validation failed.');

      const expectedSummaryLog = [`1 modules validation failed : ${notValidModule.id}`];
      const expectedDetailLog = [`Errors in module ${notValidModule.id}: {"message":"\\"details.objectives\\" doit contenir au moins 1 élément(s)","isSchemaError":true}`];
      expect(spiedLogger.error.mock.calls).toStrictEqual([expectedSummaryLog, expectedDetailLog]);

      const unchangedModules = await knex('modules').select('version', 'sections');
      const expectedModules = [{ version: '1.0', sections: notValidModule.sections }];
      expect(unchangedModules).toStrictEqual(expectedModules);
    });
  });

  describe('if userId on options is missing', () => {
    it('logs an error and do nothing', async () => {
      // given
      const module = domainBuilder.buildModule({
        shortId: 'module01',
        internalTitle: 'module-to-fix-without-draft',
        version: '1.0',
        sections: buildSectionsWithText(CONTENT_TO_FIX),
      });

      databaseBuilder.factory.buildModule(module);
      await databaseBuilder.commit();

      const spiedLogger = { info: vi.fn(), error: vi.fn() };

      // when
      await runModulesTransform({ transform: fixTextContent, options: { dryRun: false }, logger: spiedLogger });

      // then
      expect(spiedLogger.error.mock.calls).to.deep.equal([['Le userId "BOT Devcomp" est nécessaire au lancement du script.']]);

      const unchangedModule = await knex('modules').select('version', 'sections');
      const expectedModule = [{ version: '1.0', sections: module.sections }];
      expect(unchangedModule).toStrictEqual(expectedModule);
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
