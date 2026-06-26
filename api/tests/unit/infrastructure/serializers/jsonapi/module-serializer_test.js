import { describe, expect, it } from 'vitest';

import * as config from '../../../../../lib/config.js';
import { serialize } from '../../../../../lib/infrastructure/serializers/jsonapi/module-serializer.js';
import { domainBuilder } from '../../../../test-helper.js';
import { Module } from '../../../../../lib/domain/models/Module.js';

describe('Unit | Serializer | JSONAPI | module-serializer', () => {
  describe('#serialize', () => {
    it('serializes a Module model to a module payload', () => {
      // given
      const module = domainBuilder.buildModuleForConsultation({ draftModuleId: 'pouet' });
      const expectedPayload = {
        data: {
          type: 'modules',
          id: module.id,
          attributes: {
            'internal-title': module.internalTitle,
            'short-id': module.shortId,
            slug: module.slug,
            title: module.title,
            'is-beta': module.isBeta,
            visibility: module.visibility,
            details: module.details,
            sections: module.sections,
            glossary: module.glossary,
            url: `${config.pixApp.production.baseUrlFr}/modules/${module.shortId}/${module.slug}`,
            'preview-url': `${config.pixApp.production.baseUrlFr}/modules/preview/${module.shortId}/${module.slug}`,
          },
          relationships: {
            'draft-module': {
              data: {
                id: module.draftModuleId,
                type: 'draft-modules',
              },
            },
          },
        },
      };

      // when
      const serializedPayload = serialize(module);

      // then
      expect(serializedPayload).toStrictEqual(expectedPayload);
    });

    it('serializes a paginated modules excerpt list to a payload', () => {
      // given
      const modules = [domainBuilder.buildModule({ id: 'module1', internalTitle: 'MOD_1', details: { level: Module.LEVELS.EXPERT }, visibility: Module.VISIBILITIES.PRIVATE, isBeta: true }), domainBuilder.buildModule({ id: 'module2', internalTitle: 'MOD_2', details: { level: Module.LEVELS.INDEPENDENT }, visibility: Module.VISIBILITIES.PUBLIC, isBeta: false })];
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
        'url',
      ];

      // when
      const serializedPayload = serialize(modules, { attributes, meta });

      // then
      expect(serializedPayload).toStrictEqual({
        data: [
          {
            type: 'modules',
            id: modules[0].id,
            attributes: {
              'internal-title': modules[0].internalTitle,
              'is-beta': modules[0].isBeta,
              visibility: modules[0].visibility,
              details: modules[0].details,
              url: `${config.pixApp.production.baseUrlFr}/modules/${modules[0].shortId}/${modules[0].slug}`,
            },
          },
          {
            type: 'modules',
            id: modules[1].id,
            attributes: {
              'internal-title': modules[1].internalTitle,
              'is-beta': modules[1].isBeta,
              visibility: modules[1].visibility,
              details: modules[1].details,
              url: `${config.pixApp.production.baseUrlFr}/modules/${modules[1].shortId}/${modules[1].slug}`,
            },
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
});
