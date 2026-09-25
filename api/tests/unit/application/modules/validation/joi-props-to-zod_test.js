import Joi from 'joi';
import { describe, expect, it } from 'vitest';

import { joiPropsToZod } from '../../../../../lib/application/modules/validation/element/joi-props-to-zod.js';
import { validateAsync } from '../../../../../lib/application/modules/validation/validate.js';
import { convertZodModuleSchemaToJsonSchema } from '../../../../../lib/domain/services/convert-zod-module-schema-to-json-schema.js';
import { joiFrErrorMessages } from '../../../../../lib/infrastructure/schemas/joi-fr-error-messages.js';

async function messagesOf(schema, value) {
  try {
    await validateAsync(schema, value);
    return [];
  } catch (error) {
    return error.details.map(({ message }) => message);
  }
}

describe('Unit | Application | Modules | Validation | joi-props-to-zod', function() {
  const joiSchema = Joi.object({
    title: Joi.string().required(),
    subtitle: Joi.string().empty('').optional(),
    size: Joi.string().valid('small', 'large').optional(),
    date: Joi.string().isoDate().optional(),
    speed: Joi.number().integer().min(0).default(20),
    offset: Joi.number().negative(),
    image: Joi.object({ src: Joi.string().required() }).unknown(true),
    type: Joi.string().valid('text', 'image').required(),
    slides: Joi.alternatives().conditional('type', { switch: [{ is: 'text', then: Joi.array().items(Joi.object({ text: Joi.string().required() })) }, { is: 'image', then: Joi.array().items(Joi.object({ src: Joi.string().required() })).min(1).max(2) }] }).required(),
    messages: Joi.array().items(
      Joi.alternatives().conditional('.type', { switch: [{ is: 'Texte', then: Joi.object({ type: Joi.string().valid('Texte').required(), content: Joi.string().required() }) }] }),
    ),
    pair: Joi.alternatives(Joi.object({ content: Joi.string().required() }), Joi.array().items(Joi.string()).min(2)),
  }).required();

  it('should convert to the JSON Schema previously generated from the Joi schema', function() {
    const zodSchema = joiPropsToZod(joiSchema);

    expect(convertZodModuleSchemaToJsonSchema(zodSchema)).to.deep.equal({
      type: 'object',
      properties: {
        title: {
          type: 'string',
          format: null,
          options: null,
        },
        subtitle: {
          type: 'string',
          format: null,
          options: null,
        },
        size: {
          type: 'string',
          format: null,
          options: null,
          enum: ['small', 'large'],
        },
        date: {
          type: 'string',
          format: 'date',
          options: null,
        },
        speed: {
          type: 'integer',
          options: null,
          minimum: 0,
        },
        offset: {
          type: 'number',
          options: null,
          maximum: -1,
        },
        image: {
          type: 'object',
          properties: {
            src: {
              type: 'string',
              format: null,
              options: null,
            },
          },
          required: ['src'],
          additionalProperties: true,
        },
        type: {
          type: 'string',
          format: null,
          options: null,
          enum: ['text', 'image'],
        },
        slides: {
          oneOf: [
            {
              type: 'array',
              options: null,
              items: {
                type: 'object',
                properties: {
                  text: {
                    type: 'string',
                    format: null,
                    options: null,
                  },
                },
                required: ['text'],
                additionalProperties: false,
              },
              title: 'text',
            },
            {
              type: 'array',
              options: null,
              minItems: 1,
              items: {
                type: 'object',
                properties: {
                  src: {
                    type: 'string',
                    format: null,
                    options: null,
                  },
                },
                required: ['src'],
                additionalProperties: false,
              },
              title: 'image',
            },
          ],
        },
        messages: {
          type: 'array',
          options: null,
          items: {
            oneOf: [
              {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    format: null,
                    options: null,
                    enum: ['Texte'],
                  },
                  content: {
                    type: 'string',
                    format: null,
                    options: null,
                  },
                },
                required: ['type', 'content'],
                additionalProperties: false,
                title: 'Texte',
              },
            ],
            title: 'message',
            headerTemplate: 'message {{i0}}',
          },
        },
        pair: {
          oneOf: [
            {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  format: null,
                  options: null,
                },
              },
              required: ['content'],
              additionalProperties: false,
            },
            {
              type: 'array',
              options: null,
              minItems: 2,
              items: {
                type: 'string',
                format: null,
                options: null,
              },
            },
          ],
        },
      },
      required: [
        'title',
        'type',
        'slides',
      ],
      additionalProperties: false,
    });
  });

  it('should validate like Joi', async function() {
    const zodSchema = joiPropsToZod(joiSchema);
    const valid = { title: 'Titre', subtitle: '', type: 'image', slides: [{ src: 'a.png' }], image: { src: 'a', other: 1 }, pair: ['a', 'b'] };
    const values = [
      valid,
      { ...valid, slides: [{ text: 'x' }] },
      { ...valid, slides: [] },
      {
        ...valid, slides: [
          { src: 'a' },
          { src: 'b' },
          { src: 'c' },
        ],
      },
      { ...valid, type: 'video' },
      { ...valid, slides: undefined },
      { ...valid, date: 'hier', offset: 1, speed: 1.5, size: 'medium' },
      { ...valid, title: '', subtitle: 3 },
      { ...valid, messages: [{ type: 'Image' }, { type: 'Texte' }] },
      { ...valid, pair: ['a'] },
      { ...valid, pair: { content: '' } },
      { ...valid, image: 'image.png' },
    ];

    for (const value of values) {
      const joiMessages = joiSchema.messages(joiFrErrorMessages).validate(value, { abortEarly: false }).error?.details.map(({ message }) => message) ?? [];
      expect(await messagesOf(zodSchema, value), JSON.stringify(value)).to.deep.equal(joiMessages);
    }
  });

  it('should throw on unsupported Joi features', function() {
    expect(() => joiPropsToZod(Joi.object({ email: Joi.string().email() }))).to.throw('Unsupported Joi schema in custom element props');
  });
});
