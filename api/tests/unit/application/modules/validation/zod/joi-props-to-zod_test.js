import Joi from 'joi';
import { describe, expect, it } from 'vitest';

import { joiPropsToZod } from '../../../../../../lib/application/modules/validation/zod/element/joi-props-to-zod.js';
import { validateAsync } from '../../../../../../lib/application/modules/validation/zod/validate.js';
import { convertZodModuleSchemaToJsonSchema } from '../../../../../../lib/domain/services/convert-zod-module-schema-to-json-schema.js';
import { convertJoiToJsonSchema } from '../../../../../../lib/domain/services/convert-joi-rules-to-json-schema.js';
import { joiFrErrorMessages } from '../../../../../../lib/infrastructure/schemas/joi-fr-error-messages.js';

async function messagesOf(schema, value) {
  try {
    await validateAsync(schema, value);
    return [];
  } catch (error) {
    return error.details.map(({ message }) => message);
  }
}

describe('Unit | Application | Modules | Validation | Zod | joi-props-to-zod', function() {
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

  it('should convert to the same JSON Schema as the Joi converter', function() {
    const zodSchema = joiPropsToZod(joiSchema);

    expect(convertZodModuleSchemaToJsonSchema(zodSchema)).to.deep.equal(JSON.parse(JSON.stringify(convertJoiToJsonSchema(joiSchema))));
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
