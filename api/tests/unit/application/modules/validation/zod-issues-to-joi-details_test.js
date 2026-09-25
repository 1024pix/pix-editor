import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { htmlSchema, string, switchOn, uri, uuidSchema } from '../../../../../lib/application/modules/validation/utils.js';
import { validateAsync } from '../../../../../lib/application/modules/validation/validate.js';

async function messagesOf(schema, value) {
  try {
    await validateAsync(schema, value);
    return [];
  } catch (error) {
    return error.details.map(({ message }) => message);
  }
}

describe('Unit | Application | Modules | Validation | zod-issues-to-joi-details', function() {
  it('should label errors with the Joi path format', async function() {
    const schema = z.strictObject({ a: z.strictObject({ b: z.array(z.strictObject({ c: string() })) }) });

    expect(await messagesOf(schema, { a: { b: [{ c: 1 }] } })).to.deep.equal(['"a.b[0].c" doit être une chaîne de caractères']);
  });

  it('should report missing keys as required and unknown keys one by one', async function() {
    const schema = z.strictObject({ a: string(), b: z.number().optional() });

    expect(await messagesOf(schema, { b: 'x', c: 1, d: 2 })).to.deep.equal([
      '"a" est requis',
      '"b" doit être un nombre',
      '"c" n’est pas autorisé',
      '"d" n’est pas autorisé',
    ]);
  });

  it('should only report emptiness of an empty string', async function() {
    expect(await messagesOf(uuidSchema, '')).to.deep.equal(['"value" ne doit pas être vide']);
  });

  it('should report enum values and string base type errors', async function() {
    expect(await messagesOf(z.enum(['a', 'b']), 5)).to.deep.equal(['"value" doit être l’une des valeurs suivantes : [a, b]', '"value" doit être une chaîne de caractères']);
  });

  it('should report uri errors', async function() {
    expect(await messagesOf(uri(), 'https://pix.fr/a b')).to.deep.equal(['"value" doit être une URI valide']);
    expect(await messagesOf(uri({ scheme: 'https' }), 'http://pix.fr')).to.deep.equal(['"value" doit être une URI valide correspondant au schéma https']);
  });

  it('should report a value matching no alternative', async function() {
    const schema = switchOn('type', [z.strictObject({ type: z.enum(['a']) })]);

    expect(await messagesOf(schema, { type: 'z' })).to.deep.equal(['"value" ne correspond à aucun des types autorisés']);
    expect(await messagesOf(schema, 'a')).to.deep.equal(['"value" ne correspond à aucun des types autorisés']);
  });

  it('should report alternatives types', async function() {
    const schema = z.union([string().min(1), z.number().min(1)]);

    expect(await messagesOf(schema, true)).to.deep.equal(['"value" doit être l’un des types suivants : [string, number]']);
    expect(await messagesOf(schema, 0)).to.deep.equal(['"value" doit être supérieur ou égal à 1']);
  });

  it('should report external validations along with schema errors', async function() {
    const schema = z.strictObject({
      id: uuidSchema,
      content: htmlSchema(),
    });

    expect(await messagesOf(schema, { id: 'not-a-uuid', content: '<style>p {}</style>' })).to.deep.equal(['"id" doit être un GUID valide', 'htmlvalidationerror']);
    expect(await messagesOf(schema, { id: '3f6b0b3e-5b3f-4c1a-9a4e-2f1e8c3d4b5a', content: '<style>p {}</style>' })).to.deep.equal(['htmlvalidationerror']);
  });

  it('should expose the html-validate report of HTML validation errors', async function() {
    try {
      await validateAsync(z.strictObject({ content: htmlSchema() }), { content: '<style>p {}</style>' });
      throw new Error('Validation should have thrown');
    } catch (error) {
      const [detail] = error.details;
      expect(detail.type).to.equal('external');
      expect(detail.context.label).to.equal('content');
      expect(detail.context.value.results[0].messages[0].ruleId).to.equal('no-style-tag');
    }
  });
});
