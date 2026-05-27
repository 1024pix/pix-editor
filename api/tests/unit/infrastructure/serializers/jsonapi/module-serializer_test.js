import { describe, expect, it } from 'vitest';
import { serialize } from '../../../../../lib/infrastructure/serializers/jsonapi/module-serializer.js';
import { domainBuilder } from '../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | module-serializer', () => {
  describe('#serialize', () => {
    it('serializes a Module model to a module payload', () => {
      // given
      const module = domainBuilder.buildModule();
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
          },
        },
      };

      // when
      const serializedPayload = serialize(module);

      // then
      expect(serializedPayload).toStrictEqual(expectedPayload);
    });
  });
});
