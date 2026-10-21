import { render, fillIn, click } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import SchemaForm from 'pixeditor/components/schema-form';

module('Integration | Component | schema-form', function (hooks) {
  setupRenderingTest(hooks);

  // ─── Schemas de test ───────────────────────────────────────────────────────

  const simpleObjectSchema = {
    type: 'object',
    properties: {
      title: { type: 'string', format: null, options: null, minLength: 1 },
      isBeta: { type: 'boolean', options: null },
    },
  };

  const enumSchema = {
    type: 'object',
    properties: {
      visibility: {
        type: 'string',
        enum: ['private', 'public'],
        options: { infoText: 'Visibilité du module' },
      },
    },
  };

  const oneOfSchema = {
    type: 'object',
    properties: {
      elements: {
        type: 'array',
        options: null,
        items: {
          oneOf: [
            {
              title: 'text',
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid', options: null },
                type: { type: 'string', enum: ['text'], options: null },
                content: { type: 'string', format: 'jodit', options: null },
              },
            },
            {
              title: 'image',
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid', options: null },
                type: { type: 'string', enum: ['image'], options: null },
                url: { type: 'string', format: 'uri', options: null },
                alt: { type: 'string', format: null, options: null },
              },
            },
          ],
        },
      },
    },
  };

  // ─── Tests ─────────────────────────────────────────────────────────────────

  module('champs simples', function () {
    test('rend un input text pour un champ string', async function (assert) {
      const value = { title: 'Mon module', isBeta: false };

      await render(
        <template>
          <SchemaForm @schema={{simpleObjectSchema}} @value={{value}} />
        </template>,
      );

      assert.dom('input[type="text"]').exists();
      assert.dom('input[type="text"]').hasValue('Mon module');
    });

    test('rend une checkbox pour un champ boolean', async function (assert) {
      const value = { title: '', isBeta: true };

      await render(
        <template>
          <SchemaForm @schema={{simpleObjectSchema}} @value={{value}} />
        </template>,
      );

      assert.dom('input[type="checkbox"]').exists();
      assert.dom('input[type="checkbox"]').isChecked();
    });

    test('rend un select pour un champ string avec enum', async function (assert) {
      const value = { visibility: 'private' };

      await render(
        <template>
          <SchemaForm @schema={{enumSchema}} @value={{value}} />
        </template>,
      );

      assert.dom('select').exists();
      assert.dom('option[value="private"]').exists();
      assert.dom('option[value="public"]').exists();
    });

    test('affiche le infoText du schema', async function (assert) {
      const value = { visibility: 'private' };

      await render(
        <template>
          <SchemaForm @schema={{enumSchema}} @value={{value}} />
        </template>,
      );

      assert.dom('.schema-form__info').hasText('Visibilité du module');
    });

    test('rend un uuid en lecture seule', async function (assert) {
      const schema = {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', options: null },
        },
      };
      const value = { id: '550e8400-e29b-41d4-a716-446655440000' };

      await render(
        <template>
          <SchemaForm @schema={{schema}} @value={{value}} />
        </template>,
      );

      assert.dom('input[readonly]').exists();
      assert.dom('.schema-form__badge--readonly').exists();
    });
  });

  module('oneOf avec discriminant type', function () {
    test('rend le bon schéma selon value.type', async function (assert) {
      const value = {
        elements: [{ id: 'abc', type: 'image', url: 'https://example.com/img.png', alt: 'desc' }],
      };

      await render(
        <template>
          <SchemaForm @schema={{oneOfSchema}} @value={{value}} />
        </template>,
      );

      // Le champ "alt" est propre au type image
      assert.dom('.schema-form-array__item').exists();
    });

    test('préserve les données sans les modifier quand le type est inconnu', async function (assert) {
      const unknownElement = {
        id: 'xyz-456',
        type: 'future-element-type',
        someNewProperty: 'valeur importante à ne pas perdre',
      };
      const value = { elements: [unknownElement] };

      await render(
        <template>
          <SchemaForm @schema={{oneOfSchema}} @value={{value}} />
        </template>,
      );

      // UnknownField doit être affiché, pas un formulaire vide ou une erreur
      assert.dom('.schema-form-unknown').exists('UnknownField est affiché');
      assert
        .dom('.schema-form-unknown__warning')
        .includesText('future-element-type', 'le type inconnu est mentionné dans le warning');
      assert
        .dom('.schema-form-unknown__raw')
        .includesText('valeur importante à ne pas perdre', 'les données sont préservées dans le JSON affiché');
    });
  });

  module('tableau (array)', function () {
    test('affiche un bouton pour ajouter un item', async function (assert) {
      const value = { elements: [] };

      await render(
        <template>
          <SchemaForm @schema={{oneOfSchema}} @value={{value}} />
        </template>,
      );

      assert.dom('.schema-form-array__add').exists();
    });

    test('affiche un bouton supprimer pour chaque item', async function (assert) {
      const value = {
        elements: [
          { id: 'a', type: 'text', content: 'premier' },
          { id: 'b', type: 'text', content: 'deuxième' },
        ],
      };

      await render(
        <template>
          <SchemaForm @schema={{oneOfSchema}} @value={{value}} />
        </template>,
      );

      assert.dom('.schema-form-array__remove').exists({ count: 2 });
    });
  });
});
