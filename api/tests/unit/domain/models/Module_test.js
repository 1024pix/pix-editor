import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';

describe('Unit | Domain | Module', () => {
  describe('#serializeToJSON', () => {
    it('serializes module fields to JSON discarding irrelevant fields', () => {
      // given
      const module = domainBuilder.buildModule();
      const serializedFields = [
        'id',
        'shortId',
        'internalTitle',
        'slug',
        'title',
        'isBeta',
        'visibility',
        'details',
        'sections',
        'glossary',
      ];
      const expectedJSON = JSON.stringify(
        Object.fromEntries(Object.entries(module).filter(([field]) => serializedFields.includes(field))),
        null,
        2,
      );

      // when
      const json = module.serializeToJSON();

      // then
      expect(json).toStrictEqual(expectedJSON);
    });
  });
});
