import { describe, expect, it } from 'vitest';

import * as config from '../../../../../lib/config.js';
import { deserialize, serialize } from '../../../../../lib/infrastructure/serializers/jsonapi/draft-module-serializer.js';
import { domainBuilder } from '../../../../test-helper.js';
import { Module } from '../../../../../lib/domain/models/Module.js';

describe('Unit | Serializer | JSONAPI | draft-module-serializer', () => {
  describe('#serialize', () => {
    it('serializes a DraftModule model to a module payload', () => {
      // given
      const id = crypto.randomUUID();
      const draftModule = domainBuilder.buildDraftModule({ id, moduleId: id });
      const expectedPayload = {
        data: {
          type: 'draft-modules',
          id: draftModule.id,
          attributes: {
            'internal-title': draftModule.internalTitle,
            'short-id': draftModule.shortId,
            slug: draftModule.slug,
            title: draftModule.title,
            'is-beta': draftModule.isBeta,
            visibility: draftModule.visibility,
            details: draftModule.details,
            sections: draftModule.sections,
            glossary: draftModule.glossary,
            url: `${config.pixApp.recette.baseUrlFr}/modules/${draftModule.shortId}/${draftModule.slug}`,
            'preview-url': `${config.pixApp.recette.baseUrlFr}/modules/preview/${draftModule.shortId}/${draftModule.slug}`,
          },
          relationships: {
            module: {
              data: {
                type: 'modules',
                id: draftModule.moduleId,
              },
            },
            diff: { links: { related: `/api/draft-modules/${draftModule.moduleId}/diff` } },
          },
        },
      };

      // when
      const serializedPayload = serialize(draftModule);

      // then
      expect(serializedPayload).toStrictEqual(expectedPayload);
    });

    it('serializes a paginated draft modules excerpt list to a payload', () => {
      // given
      const draftModules = [domainBuilder.buildDraftModule({ id: 'module1', moduleId: 'module1', internalTitle: 'MOD_1', details: { level: Module.LEVELS.EXPERT }, visibility: Module.VISIBILITIES.PRIVATE, isBeta: true }), domainBuilder.buildDraftModule({ id: 'module2', internalTitle: 'MOD_2', details: { level: Module.LEVELS.INDEPENDENT }, visibility: Module.VISIBILITIES.PUBLIC, isBeta: false })];
      const meta = {
        page: 33,
        pageSize: 2,
        rowCount: 666,
        pageCount: 333,
      };
      const attributes = [
        'internalTitle',
        'details',
        'visibility',
        'isBeta',
        'module',
        'previewUrl',
      ];

      // when
      const serializedPayload = serialize(draftModules, { attributes, meta });

      // then
      expect(serializedPayload).toStrictEqual({
        data: [
          {
            type: 'draft-modules',
            id: draftModules[0].id,
            attributes: {
              'internal-title': draftModules[0].internalTitle,
              'is-beta': draftModules[0].isBeta,
              visibility: draftModules[0].visibility,
              details: draftModules[0].details,
              'preview-url': `${config.pixApp.recette.baseUrlFr}/modules/preview/${draftModules[0].shortId}/${draftModules[0].slug}`,
            },
            relationships: {
              module: {
                data: {
                  id: 'module1',
                  type: 'modules',
                },
              },
            },
          },
          {
            type: 'draft-modules',
            id: draftModules[1].id,
            attributes: {
              'internal-title': draftModules[1].internalTitle,
              'is-beta': draftModules[1].isBeta,
              visibility: draftModules[1].visibility,
              details: draftModules[1].details,
              'preview-url': `${config.pixApp.recette.baseUrlFr}/modules/preview/${draftModules[1].shortId}/${draftModules[1].slug}`,
            },
            relationships: { module: { data: null } },
          },
        ],
        meta: {
          page: 33,
          pageSize: 2,
          rowCount: 666,
          pageCount: 333,
        },
      });
    });
  });

  describe('#deserialize', () => {
    const readOnlyFields = [
      'version',
      'hasBeenValidated',
      'validationErrors',
      'createdAt',
      'updatedAt',
    ];

    it('deserializes payload to DraftModule model', async () => {
      // given
      const expectedDraftModule = domainBuilder.buildDraftModule();
      readOnlyFields.forEach((field) => {
        expectedDraftModule[field] = undefined;
      });
      const payload = {
        data: {
          type: 'draft-modules',
          id: expectedDraftModule.id,
          attributes: {
            'internal-title': expectedDraftModule.internalTitle,
            'short-id': expectedDraftModule.shortId,
            slug: expectedDraftModule.slug,
            title: expectedDraftModule.title,
            'is-beta': expectedDraftModule.isBeta,
            visibility: expectedDraftModule.visibility,
            details: expectedDraftModule.details,
            sections: expectedDraftModule.sections,
            glossary: expectedDraftModule.glossary,
          },
        },
      };

      // when
      const draftModule = await deserialize(payload);

      // then
      expect(draftModule).toStrictEqual(expectedDraftModule);
    });

    describe('when payload has a module relationship', () => {
      it('deserializes payload to DraftModule model', async () => {
        // given
        const expectedDraftModule = domainBuilder.buildDraftModule({ moduleId: crypto.randomUUID() });
        readOnlyFields.forEach((field) => {
          expectedDraftModule[field] = undefined;
        });
        const payload = {
          data: {
            type: 'draft-modules',
            id: expectedDraftModule.id,
            attributes: {
              'internal-title': expectedDraftModule.internalTitle,
              'short-id': expectedDraftModule.shortId,
              slug: expectedDraftModule.slug,
              title: expectedDraftModule.title,
              'is-beta': expectedDraftModule.isBeta,
              visibility: expectedDraftModule.visibility,
              details: expectedDraftModule.details,
              sections: expectedDraftModule.sections,
              glossary: expectedDraftModule.glossary,
            },
            relationships: {
              module: {
                data: {
                  type: 'modules',
                  id: expectedDraftModule.moduleId,
                },
              },
            },
          },
        };

        // when
        const draftModule = await deserialize(payload);

        // then
        expect(draftModule).toStrictEqual(expectedDraftModule);
      });
    });
  });
});
