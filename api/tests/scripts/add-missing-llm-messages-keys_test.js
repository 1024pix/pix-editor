import { describe, expect, it } from 'vitest';

import { databaseBuilder, domainBuilder, knex } from '../test-helper.js';
import { AddMissingLlmMessagesKeys } from '../../scripts/add-missing-llm-messages-keys.js';
import { logger } from '../../lib/infrastructure/logger.js';

describe('Acceptance | Script | AddMissingLlmMessagesKeys', () => {
  it('adds missing keys to llm messages of modules and draft modules', async () => {
    // given
    const sectionsWithMissingKeys = [
      {
        id: '384195d7-f39f-4929-9467-b5922b7fa614',
        type: 'question-yourself',
        grains: [
          {
            id: '6d7ef1d5-0733-4df6-9642-3a98e6580d8a',
            type: 'challenge',
            title: 'Grain avec llm-messages',
            components: [
              {
                type: 'element',
                element: {
                  id: '03bacda5-2b76-49fd-a266-3a9bb16c20c9',
                  type: 'custom',
                  tagName: 'llm-messages',
                  props: {
                    messages: [
                      { direction: 'outbound', content: 'Bonjour' },
                      { direction: 'inbound', content: 'Voici une image', illustrations: ['https://assets.pix.org/image.png'] },
                      { direction: 'outbound', content: 'Voici un fichier', attachmentName: 'fichier.pdf' },
                      { direction: 'inbound', content: 'Au revoir', illustrations: [], attachmentName: '' },
                    ],
                  },
                },
              },
            ],
          },
        ],
      },
    ];
    const sectionsWithAllKeys = [
      {
        id: '384195d7-f39f-4929-9467-b5922b7fa614',
        type: 'question-yourself',
        grains: [
          {
            id: '6d7ef1d5-0733-4df6-9642-3a98e6580d8a',
            type: 'challenge',
            title: 'Grain avec llm-messages',
            components: [
              {
                type: 'element',
                element: {
                  id: '03bacda5-2b76-49fd-a266-3a9bb16c20c9',
                  type: 'custom',
                  tagName: 'llm-messages',
                  props: {
                    messages: [
                      { direction: 'outbound', content: 'Bonjour', illustrations: [], attachmentName: '' },
                      { direction: 'inbound', content: 'Voici une image', illustrations: ['https://assets.pix.org/image.png'], attachmentName: '' },
                      { direction: 'outbound', content: 'Voici un fichier', illustrations: [], attachmentName: 'fichier.pdf' },
                      { direction: 'inbound', content: 'Au revoir', illustrations: [], attachmentName: '' },
                    ],
                  },
                },
              },
            ],
          },
        ],
      },
    ];

    const moduleToUpdateWithoutDraft = databaseBuilder.factory.buildModule(domainBuilder.buildModule({ shortId: 'mod-a', internalTitle: 'module-a-corriger-sans-draft', version: '1.0', sections: sectionsWithMissingKeys }));
    const moduleToUpdateWithDraftToUpdate = databaseBuilder.factory.buildModule(domainBuilder.buildModule({ shortId: 'mod-b', internalTitle: 'module-a-corriger-draft-a-corriger', version: '1.0', sections: sectionsWithMissingKeys }));
    const moduleToUpdateWithCompleteDraft = databaseBuilder.factory.buildModule(domainBuilder.buildModule({ shortId: 'mod-c', internalTitle: 'module-a-corriger-draft-complet', version: '1.0', sections: sectionsWithMissingKeys }));
    const completeModuleWithDraftToUpdate = databaseBuilder.factory.buildModule(domainBuilder.buildModule({ shortId: 'mod-d', internalTitle: 'module-complet-draft-a-corriger', version: '1.0', sections: sectionsWithAllKeys }));
    const completeModuleWithCompleteDraft = databaseBuilder.factory.buildModule(domainBuilder.buildModule({ shortId: 'mod-e', internalTitle: 'module-complet-draft-complet', version: '1.0', sections: sectionsWithAllKeys }));
    databaseBuilder.factory.buildDraftModule(domainBuilder.buildDraftModule({ id: moduleToUpdateWithDraftToUpdate.id, moduleId: moduleToUpdateWithDraftToUpdate.id, shortId: 'mod-b', internalTitle: 'draft-a-corriger-module-a-corriger', version: '1.3', sections: sectionsWithMissingKeys }));
    databaseBuilder.factory.buildDraftModule(domainBuilder.buildDraftModule({ id: moduleToUpdateWithCompleteDraft.id, moduleId: moduleToUpdateWithCompleteDraft.id, shortId: 'mod-c', internalTitle: 'draft-complet-module-a-corriger', version: '1.3', sections: sectionsWithAllKeys }));
    databaseBuilder.factory.buildDraftModule(domainBuilder.buildDraftModule({ id: completeModuleWithDraftToUpdate.id, moduleId: completeModuleWithDraftToUpdate.id, shortId: 'mod-d', internalTitle: 'draft-a-corriger-module-complet', version: '1.3', sections: sectionsWithMissingKeys }));
    databaseBuilder.factory.buildDraftModule(domainBuilder.buildDraftModule({ id: completeModuleWithCompleteDraft.id, moduleId: completeModuleWithCompleteDraft.id, shortId: 'mod-e', internalTitle: 'draft-complet-module-complet', version: '1.3', sections: sectionsWithAllKeys }));
    const creationDraftToUpdate = databaseBuilder.factory.buildDraftModule(domainBuilder.buildDraftModule({ shortId: 'draft-f', internalTitle: 'draft-creation-a-corriger', version: '0.3', sections: sectionsWithMissingKeys }));
    const completeCreationDraft = databaseBuilder.factory.buildDraftModule(domainBuilder.buildDraftModule({ shortId: 'draft-g', internalTitle: 'draft-creation-complet', version: '0.3', sections: sectionsWithAllKeys }));
    await databaseBuilder.commit();
    await knex('draft-module-versions').insert([
      { draftModuleId: moduleToUpdateWithDraftToUpdate.id, version: '1.3', structuredDiff: {} },
      { draftModuleId: moduleToUpdateWithCompleteDraft.id, version: '1.3', structuredDiff: {} },
      { draftModuleId: completeModuleWithDraftToUpdate.id, version: '1.3', structuredDiff: {} },
      { draftModuleId: completeModuleWithCompleteDraft.id, version: '1.3', structuredDiff: {} },
      { draftModuleId: creationDraftToUpdate.id, version: '0.3', structuredDiff: {} },
      { draftModuleId: completeCreationDraft.id, version: '0.3', structuredDiff: {} },
    ]);

    // when
    await new AddMissingLlmMessagesKeys().handle({ options: { dryRun: false }, logger });

    // then
    await expect(knex('modules').select('id', 'version', 'sections').orderBy('shortId')).resolves.toStrictEqual([
      { id: moduleToUpdateWithoutDraft.id, version: '2.0', sections: sectionsWithAllKeys },
      { id: moduleToUpdateWithDraftToUpdate.id, version: '2.0', sections: sectionsWithAllKeys },
      { id: moduleToUpdateWithCompleteDraft.id, version: '2.0', sections: sectionsWithAllKeys },
      { id: completeModuleWithDraftToUpdate.id, version: '1.0', sections: sectionsWithAllKeys },
      { id: completeModuleWithCompleteDraft.id, version: '1.0', sections: sectionsWithAllKeys },
    ]);
    await expect(knex('module-versions').select('moduleId', 'version', 'sections').orderBy('shortId')).resolves.toStrictEqual([
      { moduleId: moduleToUpdateWithoutDraft.id, version: '2.0', sections: sectionsWithAllKeys },
      { moduleId: moduleToUpdateWithDraftToUpdate.id, version: '2.0', sections: sectionsWithAllKeys },
      { moduleId: moduleToUpdateWithCompleteDraft.id, version: '2.0', sections: sectionsWithAllKeys },
    ]);
    await expect(knex('draft-modules').select('id', 'version', 'sections', 'hasBeenValidated', 'validationErrors').orderBy('shortId')).resolves.toStrictEqual([
      { id: creationDraftToUpdate.id, version: '0.4', sections: sectionsWithAllKeys, hasBeenValidated: false, validationErrors: expect.any(Array) },
      { id: completeCreationDraft.id, version: '0.3', sections: sectionsWithAllKeys, hasBeenValidated: false, validationErrors: null },
      { id: moduleToUpdateWithDraftToUpdate.id, version: '2.1', sections: sectionsWithAllKeys, hasBeenValidated: false, validationErrors: expect.any(Array) },
      { id: moduleToUpdateWithCompleteDraft.id, version: '2.1', sections: sectionsWithAllKeys, hasBeenValidated: false, validationErrors: expect.any(Array) },
      { id: completeModuleWithDraftToUpdate.id, version: '1.4', sections: sectionsWithAllKeys, hasBeenValidated: false, validationErrors: expect.any(Array) },
      { id: completeModuleWithCompleteDraft.id, version: '1.3', sections: sectionsWithAllKeys, hasBeenValidated: false, validationErrors: null },
    ]);
    await expect(knex('draft-module-versions').join('draft-modules', 'draft-modules.id', 'draft-module-versions.draftModuleId').select('shortId', 'draft-module-versions.version').orderBy(['shortId', 'draft-module-versions.version'])).resolves.toStrictEqual([
      { shortId: 'draft-f', version: '0.3' },
      { shortId: 'draft-f', version: '0.4' },
      { shortId: 'draft-g', version: '0.3' },
      { shortId: 'mod-b', version: '2.1' },
      { shortId: 'mod-c', version: '2.1' },
      { shortId: 'mod-d', version: '1.3' },
      { shortId: 'mod-d', version: '1.4' },
      { shortId: 'mod-e', version: '1.3' },
    ]);
  });

  it('does not update anything in dry run mode', async () => {
    // given
    const sectionsWithMissingKeys = [
      {
        id: '384195d7-f39f-4929-9467-b5922b7fa614',
        type: 'question-yourself',
        grains: [
          {
            id: '6d7ef1d5-0733-4df6-9642-3a98e6580d8a',
            type: 'challenge',
            title: 'Grain avec llm-messages',
            components: [
              {
                type: 'element',
                element: { id: '03bacda5-2b76-49fd-a266-3a9bb16c20c9', type: 'custom', tagName: 'llm-messages', props: { messages: [{ direction: 'outbound', content: 'Bonjour' }] } },
              },
            ],
          },
        ],
      },
    ];
    const module = databaseBuilder.factory.buildModule(domainBuilder.buildModule({ shortId: 'mod-a', internalTitle: 'module-a-corriger', version: '1.0', sections: sectionsWithMissingKeys }));
    databaseBuilder.factory.buildDraftModule(domainBuilder.buildDraftModule({ id: module.id, moduleId: module.id, shortId: 'draft-a', internalTitle: 'draft-a-corriger', version: '1.3', sections: sectionsWithMissingKeys }));
    await databaseBuilder.commit();

    // when
    await new AddMissingLlmMessagesKeys().handle({ options: { dryRun: true }, logger });

    // then
    await expect(knex('modules').select('id', 'version', 'sections')).resolves.toStrictEqual([{ id: module.id, version: '1.0', sections: sectionsWithMissingKeys }]);
    await expect(knex('draft-modules').select('id', 'version', 'sections')).resolves.toStrictEqual([{ id: module.id, version: '1.3', sections: sectionsWithMissingKeys }]);
    await expect(knex('module-versions').count().first()).resolves.toStrictEqual({ count: 0 });
    await expect(knex('draft-module-versions').count().first()).resolves.toStrictEqual({ count: 0 });
  });
});
