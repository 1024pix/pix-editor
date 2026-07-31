import { describe, expect, it } from 'vitest';
import { validateDraftModule } from '../../../../lib/domain/usecases/validate-draft-module.js';
import { databaseBuilder, domainBuilder } from '../../../test-helper.js';
import * as moduleRepository from '../../../../lib/infrastructure/repositories/module-repository.js';
import * as draftModuleRepository from '../../../../lib/infrastructure/repositories/draft-module-repository.js';

describe('Integration | Usecases | Validate draft module', () => {
  const dependencies = { moduleRepository, draftModuleRepository };

  it('marks the draft module as validated when it is valid', async () => {
    // given
    const sections = [
      {
        id: '384195d7-f39f-4929-9467-b5922b7fa614',
        type: 'question-yourself',
        grains: [
          {
            id: '6d7ef1d5-0733-4df6-9642-3a98e6580d8a',
            type: 'challenge',
            title: 'Premier grain du bac-a-sable',
            components: [
              {
                type: 'element',
                element: {
                  id: '52741aa9-396b-4ef9-86b5-aa32ff73484c',
                  type: 'qcm-declarative',
                  instruction: '<p>Quelles sont tes séries favorites ?</p>',
                  hasShortProposals: false,
                  proposals: [
                    {
                      id: '1',
                      content: 'The X-Files',
                    },
                    {
                      id: '2',
                      content: 'Friends',
                    },
                    {
                      id: '3',
                      content: 'The Wire',
                    },
                    {
                      id: '4',
                      content: 'Downton Abbey',
                    },
                  ],
                  feedback: { diagnosis: '<p>Ça va, tu as bon goût.</p>' },
                },
              },
            ],
          },
        ],
      },
    ];
    const module = domainBuilder.buildModule({ internalTitle: 'different internal title', sections });

    databaseBuilder.factory.buildModule(module);
    const { id } = databaseBuilder.factory.buildDraftModule(domainBuilder.buildDraftModule());
    await databaseBuilder.commit();

    const draftModule = await dependencies.draftModuleRepository.getById({ id });

    // when
    const result = await validateDraftModule(draftModule, dependencies);

    // then
    expect(result.hasBeenValidated).to.equal(true);
    expect(result.validationErrors).to.deep.equal([]);
  });

  it('marks the draft module of an existing module as validated when it is valid', async () => {
    // given
    const module = domainBuilder.buildModule();
    const otherModuleSections = [
      {
        id: '384195d7-f39f-4929-9467-b5922b7fa614',
        type: 'question-yourself',
        grains: [
          {
            id: '6d7ef1d5-0733-4df6-9642-3a98e6580d8a',
            type: 'challenge',
            title: 'Premier grain du bac-a-sable',
            components: [
              {
                type: 'element',
                element: {
                  id: '52741aa9-396b-4ef9-86b5-aa32ff73484c',
                  type: 'qcm-declarative',
                  instruction: '<p>Quelles sont tes séries favorites ?</p>',
                  hasShortProposals: false,
                  proposals: [
                    {
                      id: '1',
                      content: 'The X-Files',
                    },
                    {
                      id: '2',
                      content: 'Friends',
                    },
                    {
                      id: '3',
                      content: 'The Wire',
                    },
                    {
                      id: '4',
                      content: 'Downton Abbey',
                    },
                  ],
                  feedback: { diagnosis: '<p>Ça va, tu as bon goût.</p>' },
                },
              },
            ],
          },
        ],
      },
    ];
    const otherModule = domainBuilder.buildModule({ shortId: 'shortId1', internalTitle: 'other module internal title', sections: otherModuleSections });

    databaseBuilder.factory.buildModule(module);
    databaseBuilder.factory.buildModule(otherModule);
    const { id } = databaseBuilder.factory.buildDraftModule(domainBuilder.buildDraftModule({ ...module, title: 'updated title' }));
    await databaseBuilder.commit();

    const draftModule = await dependencies.draftModuleRepository.getById({ id });

    // when
    const result = await validateDraftModule(draftModule, dependencies);

    // then
    expect(result.hasBeenValidated).to.equal(true);
    expect(result.validationErrors).to.deep.equal([]);
  });

  it('marks the draft module as not validated and stores the errors when the schema is invalid', async () => {
    // given
    const sectionsWithInvalidType = [
      {
        id: 'cfaefec9-e185-43b8-8258-e8beff6dd56b',
        type: 'pamplemousse',
        grains: [
          {
            id: '9de10c46-df0e-41f5-a709-81637f0d5cc3',
            type: 'challenge',
            title: 'Premier grain du bac-a-sable',
            components: [
              {
                type: 'element',
                element: {
                  id: 'd95aff0f-e120-4bd6-9566-7d72a11f4f40',
                  type: 'qcm-declarative',
                  instruction: '<p>Quelles sont tes séries favorites ?</p>',
                  hasShortProposals: false,
                  proposals: [
                    {
                      id: '1',
                      content: 'The X-Files',
                    },
                    {
                      id: '2',
                      content: 'Friends',
                    },
                    {
                      id: '3',
                      content: 'The Wire',
                    },
                    {
                      id: '4',
                      content: 'Downton Abbey',
                    },
                  ],
                  feedback: { diagnosis: '<p>Ça va, tu as bon goût.</p>' },
                },
              },
              {
                type: 'element',
                element: {
                  id: 'd5e369ec-2a5e-4692-ac46-5be5a49f2acd',
                  type: 'text',
                  tag: 'context',
                  content: '<p>Ceci&nbsp;est un contenu avec le tag "Contexte".</p>',
                },
              },
              {
                type: 'element',
                element: {
                  id: 'fd90e4e1-5836-448c-91b4-8577e42efd09',
                  type: 'text',
                  tag: 'did-you-know',
                  content: '<p>Ceci&nbsp;est un contenu avec le tag "Le saviez-vous ?".</p>',
                },
              },
              {
                type: 'element',
                element: {
                  id: 'd199f893-42e4-40f9-b6db-70b7e6bb69b1',
                  type: 'text',
                  tag: 'tip',
                  content: '<p>Ceci&nbsp;est un contenu avec le tag "Astuce".</p>',
                },
              },
              {
                type: 'element',
                element: {
                  id: '6112afd2-db04-4172-964a-61239d451b38',
                  type: 'text',
                  tag: 'further-information',
                  content: '<p>Ceci&nbsp;est un contenu avec le tag "L’info en plus".</p>',
                },
              },
            ],
          },
        ],
      },
    ];
    const draftModuleToInsert = domainBuilder.buildDraftModule({ slug: 'not valid slug', sections: sectionsWithInvalidType });
    const { id } = databaseBuilder.factory.buildDraftModule(draftModuleToInsert);
    await databaseBuilder.commit();

    const draftModule = await dependencies.draftModuleRepository.getById({ id });

    // when
    const result = await validateDraftModule(draftModule, dependencies);

    // then
    expect(result.hasBeenValidated).to.equal(false);
    expect(result.validationErrors).to.deep.equal([
      `
Error: "slug" with value "not valid slug" fails to match the required pattern: /^[a-z0-9-]+$/.
Valeur concernée à rechercher : "not valid slug"
`,
      `
Error: "sections[0].type" must be one of [question-yourself, explore-to-understand, retain-the-essentials, practise, go-further, blank].
Valeur concernée à rechercher : "pamplemousse"
`,
    ]);
  });

  it('marks the draft module as not validated when it introduces duplicate ids among existing modules', async () => {
    // given
    const duplicateIds = [
      'cfaefec9-e185-43b8-8258-e8beff6dd56b',
      '9de10c46-df0e-41f5-a709-81637f0d5cc3',
      'd95aff0f-e120-4bd6-9566-7d72a11f4f40',
    ];
    const sections = [
      {
        id: duplicateIds[0],
        type: 'question-yourself',
        grains: [
          {
            id: duplicateIds[1],
            type: 'challenge',
            title: 'Premier grain du bac-a-sable',
            components: [
              {
                type: 'element',
                element: {
                  id: duplicateIds[2],
                  type: 'qcm-declarative',
                  instruction: '<p>Quelles sont tes séries favorites ?</p>',
                  hasShortProposals: false,
                  proposals: [
                    {
                      id: '1',
                      content: 'The X-Files',
                    },
                    {
                      id: '2',
                      content: 'Friends',
                    },
                    {
                      id: '3',
                      content: 'The Wire',
                    },
                    {
                      id: '4',
                      content: 'Downton Abbey',
                    },
                  ],
                  feedback: { diagnosis: '<p>Ça va, tu as bon goût.</p>' },
                },
              },
            ],
          },
        ],
      },
    ];
    const existingModule = domainBuilder.buildModule({ sections });
    databaseBuilder.factory.buildModule(existingModule);

    const draftModuleToInsert = domainBuilder.buildDraftModule({ slug: 'other-draft-module', shortId: 'shortid1', sections });
    const { id } = databaseBuilder.factory.buildDraftModule(draftModuleToInsert);
    await databaseBuilder.commit();

    const draftModule = await dependencies.draftModuleRepository.getById({ id });

    // when
    const result = await validateDraftModule(draftModule, dependencies);

    // then
    expect(result.hasBeenValidated).to.equal(false);
    expect(result.validationErrors).to.deep.equal([`Modules have duplicate ids: ${duplicateIds.join(', ')}`]);
  });
});
