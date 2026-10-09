import { describe, expect, it, vi } from 'vitest';

import { databaseBuilder, domainBuilder, knex } from '../../test-helper.js';
import { AddMissingLlmMessagesKeys } from '../../../scripts/modules/add-missing-llm-messages-keys.js';
import { logger } from '../../../lib/infrastructure/logger.js';

describe('Acceptance | Script | AddMissingLlmMessagesKeys', () => {
  it('adds missing keys to llm messages of modules and draft modules', async () => {
    // given
    const messageWithMissingKeys = { direction: 'outbound', content: 'Bonjour' };
    const messageWithAllKeys = { direction: 'outbound', content: 'Bonjour', illustrations: [], attachmentName: '' };

    const moduleToFixWithoutDraft = domainBuilder.buildModule({
      shortId: 'module01',
      internalTitle: 'module-to-fix-without-draft',
      version: '1.0',
      sections: buildSectionsWithLlmMessages([messageWithMissingKeys]),
    });

    const moduleToFixWithDraftToFix = domainBuilder.buildModule({
      shortId: 'module02',
      internalTitle: 'module-to-fix-with-draft-to-fix',
      version: '1.0',
      sections: buildSectionsWithLlmMessages([messageWithMissingKeys]),
    });
    const draftToFixOfModuleToFix = domainBuilder.buildDraftModule({
      ...moduleToFixWithDraftToFix,
      moduleId: moduleToFixWithDraftToFix.id,
      version: '1.1',
      sections: buildSectionsWithLlmMessages([messageWithMissingKeys]),
    });

    const moduleToFixWithUpToDateDraft = domainBuilder.buildModule({
      shortId: 'module03',
      internalTitle: 'module-to-fix-with-up-to-date-draft',
      version: '1.0',
      sections: buildSectionsWithLlmMessages([messageWithMissingKeys]),
    });
    const upToDateDraftOfModuleToFix = domainBuilder.buildDraftModule({
      ...moduleToFixWithUpToDateDraft,
      moduleId: moduleToFixWithUpToDateDraft.id,
      version: '1.1',
      sections: buildSectionsWithLlmMessages([messageWithAllKeys]),
    });

    const upToDateModuleWithDraftToFix = domainBuilder.buildModule({
      shortId: 'module04',
      internalTitle: 'up-to-date-module-with-draft-to-fix',
      version: '1.0',
      sections: buildSectionsWithLlmMessages([messageWithAllKeys]),
    });
    const draftToFixOfUpToDateModule = domainBuilder.buildDraftModule({
      ...upToDateModuleWithDraftToFix,
      moduleId: upToDateModuleWithDraftToFix.id,
      version: '1.1',
      sections: buildSectionsWithLlmMessages([messageWithMissingKeys]),
    });

    const upToDateModuleWithUpToDateDraft = domainBuilder.buildModule({
      shortId: 'module05',
      internalTitle: 'up-to-date-module-with-up-to-date-draft',
      version: '1.0',
      sections: buildSectionsWithLlmMessages([messageWithAllKeys]),
    });
    const upToDateDraftOfUpToDateModule = domainBuilder.buildDraftModule({
      ...upToDateModuleWithUpToDateDraft,
      moduleId: upToDateModuleWithUpToDateDraft.id,
      version: '1.1',
      sections: buildSectionsWithLlmMessages([messageWithAllKeys]),
    });

    const creationDraftToFix = domainBuilder.buildDraftModule({
      shortId: 'draft001',
      internalTitle: 'creation-draft-to-fix',
      version: '0.1',
      sections: buildSectionsWithLlmMessages([messageWithMissingKeys]),
    });
    const upToDateCreationDraft = domainBuilder.buildDraftModule({
      shortId: 'draft002',
      internalTitle: 'up-to-date-creation-draft',
      version: '0.1',
      sections: buildSectionsWithLlmMessages([messageWithAllKeys]),
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
    await new AddMissingLlmMessagesKeys().handle({ options: { dryRun: false }, logger });

    // then
    const llmMessages = knex.raw("sections #> '{0,grains,0,components,0,element,props,messages}' as messages");

    await expect(knex('modules').select('internalTitle', 'version', llmMessages).orderBy('shortId')).resolves.toStrictEqual([
      { internalTitle: 'module-to-fix-without-draft', version: '2.0', messages: [messageWithAllKeys] },
      { internalTitle: 'module-to-fix-with-draft-to-fix', version: '2.0', messages: [messageWithAllKeys] },
      { internalTitle: 'module-to-fix-with-up-to-date-draft', version: '2.0', messages: [messageWithAllKeys] },
      { internalTitle: 'up-to-date-module-with-draft-to-fix', version: '1.0', messages: [messageWithAllKeys] },
      { internalTitle: 'up-to-date-module-with-up-to-date-draft', version: '1.0', messages: [messageWithAllKeys] },
    ]);
    await expect(knex('module-versions').select('internalTitle', 'version').orderBy('shortId')).resolves.toStrictEqual([
      { internalTitle: 'module-to-fix-without-draft', version: '2.0' },
      { internalTitle: 'module-to-fix-with-draft-to-fix', version: '2.0' },
      { internalTitle: 'module-to-fix-with-up-to-date-draft', version: '2.0' },
    ]);
    await expect(knex('draft-modules').select('internalTitle', 'version', llmMessages).orderBy('shortId')).resolves.toStrictEqual([
      { internalTitle: 'creation-draft-to-fix', version: '0.2', messages: [messageWithAllKeys] },
      { internalTitle: 'up-to-date-creation-draft', version: '0.1', messages: [messageWithAllKeys] },
      { internalTitle: 'module-to-fix-with-draft-to-fix', version: '2.1', messages: [messageWithAllKeys] },
      { internalTitle: 'module-to-fix-with-up-to-date-draft', version: '2.1', messages: [messageWithAllKeys] },
      { internalTitle: 'up-to-date-module-with-draft-to-fix', version: '1.2', messages: [messageWithAllKeys] },
      { internalTitle: 'up-to-date-module-with-up-to-date-draft', version: '1.1', messages: [messageWithAllKeys] },
    ]);
    await expect(knex('draft-module-versions').join('draft-modules', 'draft-modules.id', 'draft-module-versions.draftModuleId').select('internalTitle', 'draft-module-versions.version').orderBy('shortId')).resolves.toStrictEqual([
      { internalTitle: 'creation-draft-to-fix', version: '0.2' },
      { internalTitle: 'module-to-fix-with-draft-to-fix', version: '2.1' },
      { internalTitle: 'module-to-fix-with-up-to-date-draft', version: '2.1' },
      { internalTitle: 'up-to-date-module-with-draft-to-fix', version: '1.2' },
    ]);
  });

  it('logs what would be updated and does not update anything in dry run mode', async () => {
    // given
    const module = domainBuilder.buildModule({
      internalTitle: 'module-to-fix',
      version: '1.0',
      sections: buildSectionsWithLlmMessages([{ direction: 'outbound', content: 'Bonjour' }]),
    });
    const draftOfModule = domainBuilder.buildDraftModule({ ...module, version: '1.1', moduleId: module.id });

    databaseBuilder.factory.buildModule(module);
    databaseBuilder.factory.buildDraftModule(draftOfModule);
    await databaseBuilder.commit();

    const spiedLogger = { info: vi.fn() };

    // when
    await new AddMissingLlmMessagesKeys().handle({ options: { dryRun: true }, logger: spiedLogger });

    // then
    expect(spiedLogger.info.mock.calls).toStrictEqual([
      [{ dryRun: true }, 'Script options'],
      [
        {
          id: module.id,
          internalTitle: 'module-to-fix',
          version: '1.0',
          numberOfEditedObjects: 1,
        },
        'Module to update',
      ],
      ['1 module(s) to update, 1 object(s) to complete'],
      [
        {
          id: draftOfModule.id,
          internalTitle: 'module-to-fix',
          version: '1.1',
          numberOfEditedObjects: 1,
          willBeRecreated: true,
        },
        'Draft module to update',
      ],
      ['1 draft module(s) to update (1 recreated because their module is updated), 1 object(s) to complete'],
      ['Dry run: nothing saved. Re-run with --dryRun=false to apply changes.'],
    ]);

    await expect(knex('modules').select('version', 'sections')).resolves.toStrictEqual([
      {
        version: '1.0',
        sections: module.sections,
      },
    ]);
    await expect(knex('draft-modules').select('version', 'sections')).resolves.toStrictEqual([
      {
        version: '1.1',
        sections: draftOfModule.sections,
      },
    ]);
    await expect(knex('module-versions').count().first()).resolves.toStrictEqual({ count: 0 });
    await expect(knex('draft-module-versions').count().first()).resolves.toStrictEqual({ count: 0 });
  });
});

function buildSectionsWithLlmMessages(messages) {
  return [
    {
      id: crypto.randomUUID(),
      type: 'question-yourself',
      grains: [
        {
          id: crypto.randomUUID(),
          type: 'challenge',
          title: 'Grain',
          components: [
            {
              type: 'element',
              element: {
                id: crypto.randomUUID(),
                type: 'custom',
                tagName: 'llm-messages',
                title: '',
                instruction: '',
                functionalInstruction: '',
                props: { messages },
              },
            },
          ],
        },
      ],
    },
  ];
}
