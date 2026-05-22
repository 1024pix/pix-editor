import { describe, expect, it } from 'vitest';
import { deserialize, serialize } from '../../../../../lib/infrastructure/serializers/jsonapi/module-serializer.js';
import { domainBuilder } from '../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | module-serializer', () => {
  describe('#deserialize', () => {
    it('deserializes a module payload to a Module model', async () => {
      // given
      const expectedModule = domainBuilder.buildModule();
      expectedModule.createdAt = undefined;
      expectedModule.updatedAt = undefined;
      const modulePayload = {
        data: {
          type: 'modules',
          id: expectedModule.id,
          attributes: {
            'internal-title': expectedModule.internalTitle,
            'short-id': expectedModule.shortId,
            slug: expectedModule.slug,
            title: expectedModule.title,
            'is-beta': expectedModule.isBeta,
            visibility: expectedModule.visibility,
            details: expectedModule.details,
            sections: expectedModule.sections,
            glossary: expectedModule.glossary,
          },
        },
      };

      // when
      const deserializedModule = await deserialize(modulePayload);

      // then
      expect(deserializedModule).toStrictEqual(expectedModule);
    });
  });

  describe('#serialize', () => {
    it('serializes a Module model to a module payload', () => {
      // given
      const module = domainBuilder.buildModule();
      const expectedPayload = {
        data: {
          type: 'modules',
          id: module.id,
          attributes: {
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
