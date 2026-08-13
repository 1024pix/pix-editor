import { describe, describe as context, it, expect } from 'vitest';
import { ModulesValidation } from '../../../../lib/domain/models/ModulesValidation.js';

describe('Unit | Domain | Modules', () => {
  context('#constructor', () => {
    it('should create a new Modules instance', function() {
      // given
      const modules = _buildModules();

      // when
      const result = new ModulesValidation({ modules });

      // then
      expect(result).to.be.an.instanceOf(ModulesValidation);
      expect(result.modules).to.deep.equal(modules);
    });
  });
  context('validateDraftModuleDoesNotHaveDuplicateIds', function() {
    it('should not throw when draft module has no duplicate ids with existing modules', () => {
      // given
      const modules = _buildModules();
      const draftModule = _buildDraftModule();

      // when / then
      try {
        const result = new ModulesValidation({ modules });
        result.validateDraftModuleDoesNotHaveDuplicateIds(draftModule);
      } catch (error) {
        expect.fail(`ModuleDuplicateIdsError should not be thrown ${error}`);
      }
    });
    context('when draft module is a draft of an existing module', () => {
      it('should not throw an error when there is no duplicate ids', function() {
        // given
        const modules = _buildModules();
        const draftModule = { ...modules[1], title: 'Bac à sable mis à jour' };

        // when / then
        try {
          const result = new ModulesValidation({ modules });
          result.validateDraftModuleDoesNotHaveDuplicateIds(draftModule);
        } catch (error) {
          expect.fail(`ModuleDuplicateIdsError should not be thrown ${error}`);
        }
      });
    });
    context('errors', () => {
      context('when draft module has duplicate ids with existing modules', () => {
        it('should throw an error which includes duplicate ids', function() {
          // given
          const modules = _buildModules();
          const draftModule = _buildDraftModule();
          setSameIdInSectionAndGrain({ module: modules[0], draftModule });

          try {
            // when
            const result = new ModulesValidation({ modules });
            result.validateDraftModuleDoesNotHaveDuplicateIds(draftModule);
            expect.fail('should have thrown a ModuleDuplicateIdsError');
          } catch (error) {
            // then
            const duplicateIds = [draftModule.sections[0].id, draftModule.sections[0].grains[0].id];
            expect(error.message).to.equal(`Le brouillon a des ids dupliqués : ${duplicateIds.join(', ')}`);
            expect(error.duplicateIds).to.deep.equal(duplicateIds);
          }
        });
      });

      context('when modules have duplicate ids in stepper', () => {
        it('should throw an error which includes duplicate ids', function() {
          // given
          const modules = _buildModules();
          const draftModule = _buildDraftModule();
          const duplicateId = '868a2c39-d70b-45ba-847d-76d11a83a6fd';
          addStepperInDraftModuleWithDuplicateIds({ draftModule, duplicateId });

          try {
            // when
            const result = new ModulesValidation({ modules });
            result.validateDraftModuleDoesNotHaveDuplicateIds(draftModule);
            expect.fail('should have thrown a ModuleDuplicateIdsError');
          } catch (error) {
            // then
            expect(error.message).to.equal(`Le brouillon a des ids dupliqués : ${duplicateId}`);
            expect(error.duplicateIds).to.deep.equal([duplicateId]);
          }
        });
      });

      context('when modules have duplicate ids in flashcard and qab', () => {
        it('should throw an error which includes duplicate ids', function() {
          // given
          const modules = _buildModules();
          const duplicateId = '868a2c39-d70b-45ba-847d-76d11a83a6fd';
          const draftModule = _buildDraftModule();
          addFlashcardAndQabWithDuplicateIds({ draftModule, duplicateId });

          try {
            // when
            const result = new ModulesValidation({ modules });
            result.validateDraftModuleDoesNotHaveDuplicateIds(draftModule);
            expect.fail('should have thrown a ModuleDuplicateIdsError');
          } catch (error) {
            // then
            expect(error.message).to.equal(`Le brouillon a des ids dupliqués : ${duplicateId}`);
            expect(error.duplicateIds).to.deep.equal([duplicateId]);
          }
        });
      });
    });
  });
});

const _buildModules = () => {
  return [
    {
      id: '6282925d-4775-4bca-b513-4c3009ec5886',
      shortId: '6a68bf32',
      slug: 'bac-a-sable',
      title: 'Bac à sable',
      isBeta: true,
      visibility: 'private',
      details: {
        image: 'https://assets.pix.org/modules/placeholder-details.svg',
        description: "<p>Ce module est dédié à des tests internes à Pix.</p><p>Il contient normalement l'intégralité des fonctionnalités disponibles à date.</p>",
        duration: 5,
        level: 'novice',
        objectives: ['Non régression fonctionnelle'],
        tabletSupport: 'inconvenient',
      },
      sections: [
        {
          id: 'cfaefec9-e185-43b8-8258-e8beff6dd56b',
          type: 'question-yourself',
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
              ],
            },
          ],
        },
      ],
      glossary: [
        {
          word: 'chat',
          definition: '<p>Le chat, plus spécifiquement désigné sous le nom de chat domestique, est une espèce de mammifères de l’Ordre des Carnivores, de la famille des félins (Félidés).</p>',
        },
      ],
    },
    {
      id: '4dde6a55-d8b5-4512-b4e4-f87e9428e465',
      shortId: '6a68bf33',
      slug: 'bac-a-sable-copy',
      title: 'Bac à sable (Copie)',
      isBeta: true,
      visibility: 'private',
      details: {
        image: 'https://assets.pix.org/modules/placeholder-details.svg',
        description: "<p>Ce module est dédié à des tests internes à Pix.</p><p>Il contient normalement l'intégralité des fonctionnalités disponibles à date.</p>",
        duration: 5,
        level: 'novice',
        objectives: ['Non régression fonctionnelle'],
        tabletSupport: 'inconvenient',
      },
      sections: [
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
      ],
      glossary: [
        {
          word: 'chat',
          definition: '<p>Le chat, plus spécifiquement désigné sous le nom de chat domestique, est une espèce de mammifères de l’Ordre des Carnivores, de la famille des félins (Félidés).</p>',
        },
      ],
    },
  ];
};
const _buildDraftModule = () => {
  return {
    id: '9041fdf9-e462-480c-bc42-9a8b67573346',
    shortId: '6a68bf34',
    slug: 'bac-a-sable-2',
    title: 'Bac à sable 2',
    isBeta: true,
    visibility: 'private',
    details: {
      image: 'https://assets.pix.org/modules/placeholder-details.svg',
      description: "<p>Ce module est dédié à des tests internes à Pix.</p><p>Il contient normalement l'intégralité des fonctionnalités disponibles à date.</p>",
      duration: 5,
      level: 'novice',
      objectives: ['Non régression fonctionnelle'],
      tabletSupport: 'inconvenient',
    },
    sections: [
      {
        id: 'b11bf989-2052-41b0-b90e-0e235c855ae7',
        type: 'question-yourself',
        grains: [
          {
            id: 'edab9637-9398-4900-94b8-ced82ff85a7b',
            type: 'challenge',
            title: 'Premier grain du bac-a-sable',
            components: [
              {
                type: 'element',
                element: {
                  id: 'c9a1c3c5-a458-4c14-8123-9940bc7d0811',
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
    ],
    glossary: [
      {
        word: 'chat',
        definition: '<p>Le chat, plus spécifiquement désigné sous le nom de chat domestique, est une espèce de mammifères de l’Ordre des Carnivores, de la famille des félins (Félidés).</p>',
      },
    ],
  };
};

const setSameIdInSectionAndGrain = ({ module, draftModule }) => {
  draftModule.sections[0].id = module.sections[0].id;
  draftModule.sections[0].grains[0].id = module.sections[0].grains[0].id;
};

const addStepperInDraftModuleWithDuplicateIds = ({ draftModule, duplicateId }) => {
  draftModule.sections[0].grains.push({
    id: '1dc50ca6-355c-4d7f-941b-608788faa4db',
    type: 'short-lesson',
    title: 'Exemple de stepper leçon',
    components: [
      {
        type: 'stepper',
        instruction: '<p>😎COOL GANG 😎. Cette instruction ne sera pas visible dans le module.</p>',
        steps: [
          {
            elements: [
              {
                id: duplicateId,
                type: 'text',
                tag: ' ',
                content: '<p>Pour apprendre à une IA générative à produire du texte, on lui fait analyser des milliards de textes variés. 📚</p>',
              },
            ],
          },
          {
            elements: [
              {
                id: duplicateId,
                type: 'text',
                tag: ' ',
                content: "<p>L’IA générative s’entraîne à masquer puis&nbsp;deviner&nbsp;des mots au hasard parmi tous ces textes. 🙈</p><p>Petit à petit elle s'améliore&nbsp;: elle apprend quels mots apparaissent&nbsp;souvent&nbsp;ensemble. 🐈 🐁</p>",
              },
            ],
          },
        ],
      },
    ],
  });
};

const addFlashcardAndQabWithDuplicateIds = ({ draftModule, duplicateId }) => {
  const flashcardElement = {
    type: 'element',
    element: {
      id: '47823e8f-a4af-44d6-96f7-5b6fc7bc6b51',
      type: 'flashcards',
      instruction: '<p><strong>Pour chaque carte</strong>&nbsp;:&nbsp;</p><ol><li>Lisez la question. <span aria-hidden="true">👀</span></li><li>Essayez de trouver la réponse dans votre tête. <span aria-hidden="true">🤔</span></li><li>Retournez la carte en cliquant sur Voir la réponse. <span aria-hidden="true">↪️</span></li></ol><p>Cela permet de <strong>tester votre mémoire</strong>.<span aria-hidden="true">🎯</span></p>',
      title: 'Introduction à la poésie',
      introImage: { url: 'https://assets.pix.org/modules/bac-a-sable/intro-flashcards.png' },
      cards: [
        {
          id: duplicateId,
          recto: {
            image: { url: 'https://assets.pix.org/modules/bac-a-sable/icon.svg' },
            text: 'Qui a écrit « Le Dormeur du Val ? »',
          },
          verso: {
            image: { url: '' },
            text: '<p>Arthur Rimbaud</p>',
          },
        },
      ],
    },
  };
  const qabElement = {
    type: 'element',
    element: {
      id: 'ed795d29-5f04-499c-a9c8-4019125c5cb1',
      type: 'qab',
      instruction: '<p><strong>Maintenant, entraînez-vous sur des exemples concrets !</strong> </p> <p> Pour chaque exemple, choisissez si l’affirmation est <strong>vraie</strong> ou <strong>fausse</strong>.</p>',
      cards: [
        {
          id: duplicateId,
          text: 'Les boules de pétanques sont creuses ?',
          image: {
            url: 'https://assets.pix.org/modules/bac-a-sable/boules-de-petanque.jpg',
            altText: '',
          },
          proposalA: 'Vrai',
          proposalB: 'Faux',
          solution: 'A',
        },
      ],
      feedback: { diagnosis: '<p>Continuez comme ça !</p>' },
    },
  };
  draftModule.sections[0].grains[0].components.push(flashcardElement);
  draftModule.sections[0].grains[0].components.push(qabElement);
};
