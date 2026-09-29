import { describe, expect, it } from 'vitest';

import { domainBuilder } from '../../../test-helper.js';
import { addMissingKeysToLlmMessages } from '../../../../lib/domain/usecases/index.js';
import { DraftModule } from '../../../../lib/domain/models/index.js';

describe('Unit | Domain | Use Cases | add-missing-keys-to-llm-messages', () => {
  it('adds illustrations and attachmentName to a message without both keys', () => {
    // given
    const module = buildModule([
      buildSection([
        buildGrain([
          buildElementComponent(buildLlmMessagesElement([
            {
              direction: 'outbound',
              content: 'Bonjour',
            },
          ])),
        ]),
      ]),
    ]);

    // when
    const { updatedModule, numberOfUpdatedMessages } = addMissingKeysToLlmMessages(module);

    // then
    expect(numberOfUpdatedMessages).toBe(1);
    expect(updatedModule.sections[0].grains[0].components[0].element.props.messages).toStrictEqual([
      {
        direction: 'outbound',
        content: 'Bonjour',
        illustrations: [],
        attachmentName: '',
      },
    ]);
  });

  it('adds only illustrations to a message which already has an attachmentName', () => {
    // given
    const module = buildModule([
      buildSection([
        buildGrain([
          buildElementComponent(buildLlmMessagesElement([
            {
              direction: 'outbound',
              content: 'Voici un fichier',
              attachmentName: 'fichier.pdf',
            },
          ])),
        ]),
      ]),
    ]);

    // when
    const { updatedModule, numberOfUpdatedMessages } = addMissingKeysToLlmMessages(module);

    // then
    expect(numberOfUpdatedMessages).toBe(1);
    expect(updatedModule.sections[0].grains[0].components[0].element.props.messages).toStrictEqual([
      {
        direction: 'outbound',
        content: 'Voici un fichier',
        attachmentName: 'fichier.pdf',
        illustrations: [],
      },
    ]);
  });

  it('adds only attachmentName to a message which already has illustrations', () => {
    // given
    const module = buildModule([
      buildSection([
        buildGrain([
          buildElementComponent(buildLlmMessagesElement([
            {
              direction: 'inbound',
              content: 'Voici une image',
              illustrations: ['https://assets.pix.org/image.png'],
            },
          ])),
        ]),
      ]),
    ]);

    // when
    const { updatedModule, numberOfUpdatedMessages } = addMissingKeysToLlmMessages(module);

    // then
    expect(numberOfUpdatedMessages).toBe(1);
    expect(updatedModule.sections[0].grains[0].components[0].element.props.messages).toStrictEqual([
      {
        direction: 'inbound',
        content: 'Voici une image',
        illustrations: ['https://assets.pix.org/image.png'],
        attachmentName: '',
      },
    ]);
  });

  it('does not update messages which already have both keys', () => {
    // given
    const module = buildModule([
      buildSection([
        buildGrain([
          buildElementComponent(buildLlmMessagesElement([
            {
              direction: 'outbound',
              content: 'Bonjour',
              illustrations: [],
              attachmentName: '',
            },
            {
              direction: 'inbound',
              content: 'Voici une image',
              illustrations: ['https://assets.pix.org/image.png'],
              attachmentName: 'fichier.pdf',
            },
          ])),
        ]),
      ]),
    ]);

    // when
    const { updatedModule, numberOfUpdatedMessages } = addMissingKeysToLlmMessages(module);

    // then
    expect(numberOfUpdatedMessages).toBe(0);
    expect(updatedModule.sections[0].grains[0].components[0].element.props.messages).toStrictEqual([
      {
        direction: 'outbound',
        content: 'Bonjour',
        illustrations: [],
        attachmentName: '',
      },
      {
        direction: 'inbound',
        content: 'Voici une image',
        illustrations: ['https://assets.pix.org/image.png'],
        attachmentName: 'fichier.pdf',
      },
    ]);
  });

  it('adds missing keys to messages grouped in a nested array', () => {
    // given
    const module = buildModule([
      buildSection([
        buildGrain([
          buildElementComponent(buildLlmMessagesElement([
            {
              direction: 'outbound',
              content: 'Comment aller de Rennes à Brest ?',
            },
            [
              {
                direction: 'inbound',
                content: 'Voici les itinéraires',
                illustrations: [],
                attachmentName: '',
              },
              { direction: 'inbound', content: 'Plusieurs options sont disponibles' },
            ],
          ])),
        ]),
      ]),
    ]);

    // when
    const { updatedModule, numberOfUpdatedMessages } = addMissingKeysToLlmMessages(module);

    // then
    expect(numberOfUpdatedMessages).toBe(2);
    expect(updatedModule.sections[0].grains[0].components[0].element.props.messages).toStrictEqual([
      {
        direction: 'outbound',
        content: 'Comment aller de Rennes à Brest ?',
        illustrations: [],
        attachmentName: '',
      },
      [
        {
          direction: 'inbound',
          content: 'Voici les itinéraires',
          illustrations: [],
          attachmentName: '',
        },
        { direction: 'inbound', content: 'Plusieurs options sont disponibles', illustrations: [], attachmentName: '' },
      ],
    ]);
  });

  it('adds missing keys to llm messages elements of every step of a stepper', () => {
    // given
    const module = buildModule([
      buildSection([
        buildGrain([
          buildStepperComponent([
            [
              buildTextElement({ id: 'element-1' }),
              buildLlmMessagesElement([
                {
                  direction: 'outbound',
                  content: 'Bonjour',
                },
              ], { id: 'element-2' }),
            ],
            [
              buildLlmMessagesElement([
                {
                  direction: 'inbound',
                  content: 'Au revoir',
                },
              ], { id: 'element-3' }),
            ],
          ]),
        ]),
      ]),
    ]);

    // when
    const { updatedModule, numberOfUpdatedMessages } = addMissingKeysToLlmMessages(module);

    // then
    expect(numberOfUpdatedMessages).toBe(2);
    expect(updatedModule.sections[0].grains[0].components[0]).toStrictEqual(buildStepperComponent([
      [
        buildTextElement({ id: 'element-1' }),
        buildLlmMessagesElement([
          {
            direction: 'outbound',
            content: 'Bonjour',
            illustrations: [],
            attachmentName: '',
          },
        ], { id: 'element-2' }),
      ],
      [
        buildLlmMessagesElement([
          {
            direction: 'inbound',
            content: 'Au revoir',
            illustrations: [],
            attachmentName: '',
          },
        ], { id: 'element-3' }),
      ],
    ]));
  });

  it('adds missing keys to llm messages elements of every section, grain and component', () => {
    // given
    const module = buildModule([
      buildSection([
        buildGrain([
          buildElementComponent(buildLlmMessagesElement([
            {
              direction: 'outbound',
              content: 'Bonjour',
            },
            {
              direction: 'inbound',
              content: 'Salut',
              illustrations: [],
              attachmentName: '',
            },
          ], { id: 'element-1' })),
          buildElementComponent(buildLlmMessagesElement([
            {
              direction: 'outbound',
              content: 'Ça va ?',
            },
          ], { id: 'element-2' })),
        ], { id: 'grain-1' }),
        buildGrain([
          buildElementComponent(buildLlmMessagesElement([
            {
              direction: 'inbound',
              content: 'Oui',
            },
          ], { id: 'element-3' })),
        ], { id: 'grain-2' }),
      ], { id: 'section-1' }),
      buildSection([
        buildGrain([
          buildElementComponent(buildLlmMessagesElement([
            {
              direction: 'outbound',
              content: 'Au revoir',
            },
          ], { id: 'element-4' })),
        ], { id: 'grain-3' }),
      ], { id: 'section-2' }),
    ]);

    // when
    const { updatedModule, numberOfUpdatedMessages } = addMissingKeysToLlmMessages(module);

    // then
    expect(numberOfUpdatedMessages).toBe(4);
    expect(updatedModule.sections[0].grains[0].components[0].element.props.messages).toStrictEqual([
      {
        direction: 'outbound',
        content: 'Bonjour',
        illustrations: [],
        attachmentName: '',
      },
      { direction: 'inbound', content: 'Salut', illustrations: [], attachmentName: '' },
    ]);
    expect(updatedModule.sections[0].grains[0].components[1].element.props.messages).toStrictEqual([
      {
        direction: 'outbound',
        content: 'Ça va ?',
        illustrations: [],
        attachmentName: '',
      },
    ]);
    expect(updatedModule.sections[0].grains[1].components[0].element.props.messages).toStrictEqual([
      {
        direction: 'inbound',
        content: 'Oui',
        illustrations: [],
        attachmentName: '',
      },
    ]);
    expect(updatedModule.sections[1].grains[0].components[0].element.props.messages).toStrictEqual([
      {
        direction: 'outbound',
        content: 'Au revoir',
        illustrations: [],
        attachmentName: '',
      },
    ]);
  });

  it('ignores elements which are not llm messages and llm messages elements without messages', () => {
    // given
    const module = buildModule([
      buildSection([
        buildGrain([
          buildElementComponent({
            id: 'element-1',
            type: 'custom',
            tagName: 'other-custom',
            props: { messages: [{ direction: 'outbound', content: 'Bonjour' }] },
          }),
          buildElementComponent(buildTextElement({ id: 'element-2' })),
          buildElementComponent({ id: 'element-3', type: 'custom', tagName: 'llm-messages', props: {} }),
        ]),
      ]),
    ]);

    // when
    const { updatedModule, numberOfUpdatedMessages } = addMissingKeysToLlmMessages(module);

    // then
    expect(numberOfUpdatedMessages).toBe(0);
    expect(updatedModule.sections[0].grains[0].components).toStrictEqual([
      buildElementComponent({
        id: 'element-1',
        type: 'custom',
        tagName: 'other-custom',
        props: { messages: [{ direction: 'outbound', content: 'Bonjour' }] },
      }),
      buildElementComponent(buildTextElement({ id: 'element-2' })),
      buildElementComponent({ id: 'element-3', type: 'custom', tagName: 'llm-messages', props: {} }),
    ]);
  });

  it('returns an updated copy of the draft module without modifying the given draft module', () => {
    // given
    const draftModule = domainBuilder.buildDraftModule({
      moduleId: 'module-1',
      sections: [
        buildSection([
          buildGrain([
            buildElementComponent(buildLlmMessagesElement([
              {
                direction: 'outbound',
                content: 'Bonjour',
              },
            ])),
          ]),
        ]),
      ],
    });

    // when
    const { updatedModule } = addMissingKeysToLlmMessages(draftModule);

    // then
    expect(updatedModule).toBeInstanceOf(DraftModule);
    expect(updatedModule).toStrictEqual(new DraftModule({
      ...draftModule,
      sections: [
        buildSection([
          buildGrain([
            buildElementComponent(buildLlmMessagesElement([
              {
                direction: 'outbound',
                content: 'Bonjour',
                illustrations: [],
                attachmentName: '',
              },
            ])),
          ]),
        ]),
      ],
    }));
    expect(draftModule.sections[0].grains[0].components[0].element.props.messages).toStrictEqual([
      {
        direction: 'outbound',
        content: 'Bonjour',
      },
    ]);
  });
});

function buildModule(sections) {
  return domainBuilder.buildModule({ sections });
}

function buildSection(grains, { id = 'section-1', type = 'question-yourself' } = {}) {
  return { id, type, grains };
}

function buildGrain(components, { id = 'grain-1', type = 'challenge', title = 'Grain' } = {}) {
  return { id, type, title, components };
}

function buildElementComponent(element) {
  return { type: 'element', element };
}

function buildStepperComponent(stepsElements) {
  return { type: 'stepper', steps: stepsElements.map((elements) => ({ elements })) };
}

function buildLlmMessagesElement(messages, { id = 'element-1' } = {}) {
  return { id, type: 'custom', tagName: 'llm-messages', props: { messages } };
}

function buildTextElement({ id = 'element-1' } = {}) {
  return { id, type: 'text', content: '<p>Texte</p>' };
}
