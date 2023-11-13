import { describe, expect, it } from 'vitest';

import {
  extractFromAirtableObject,
  hydrateReleaseObject,
  hydrateToAirtableObject,
  dehydrateAirtableObject,
  prefixFor, extractFromReleaseObject,
} from '../../../../lib/infrastructure/translations/utils.js';

describe('Unit | Infrastructure | Entity translations', () => {
  const fields = [
    { airtableField: 'Attribut', field: 'attribute' },
    { airtableField: 'Attribut2', field: 'attribute2' },
  ];

  const locales = [
    { airtableLocale: 'fr-fr', locale: 'fr' },
    { airtableLocale: 'en-us', locale: 'en' },
  ];

  const localizedFields = [
    { airtableField: 'Attribut', field: 'attribute', airtableLocale: 'fr-fr', locale: 'fr' },
    { airtableField: 'Attribut', field: 'attribute', airtableLocale: 'en-us', locale: 'en' },
    { airtableField: 'Attribut2', field: 'attribute2', airtableLocale: 'fr-fr', locale: 'fr' },
    { airtableField: 'Attribut2', field: 'attribute2', airtableLocale: 'en-us', locale: 'en' },
  ];

  const prefix = 'entity.';

  describe('#extractFromAirtableObject', () => {
    it('should return the list of translations', () => {
      // given
      const entity = {
        'id persistant': 'test',
        'Attribut fr-fr': 'value fr-fr',
        'Attribut en-us': 'value en-us',
        'Attribut2 fr-fr': 'value2 fr-fr',
        'Attribut2 en-us': 'value2 en-us',
      };

      // when
      const translations = extractFromAirtableObject({ localizedFields, prefix })(entity);

      // then
      expect(translations).to.deep.equal([
        { key: 'entity.test.attribute', locale: 'fr', value: 'value fr-fr' },
        { key: 'entity.test.attribute', locale: 'en', value: 'value en-us' },
        { key: 'entity.test.attribute2', locale: 'fr', value: 'value2 fr-fr' },
        { key: 'entity.test.attribute2', locale: 'en', value: 'value2 en-us' },
      ]);
    });

    it('should return translations only for field w/ values', () => {
      // given
      const entity = {
        'id persistant': 'test',
        'Attribut fr-fr': 'value fr-fr',
        'Attribut en-us': 'value en-us',
      };

      // when
      const translations = extractFromAirtableObject({ localizedFields, prefix })(entity);

      // then
      expect(translations).to.deep.equal([
        { key: 'entity.test.attribute', locale: 'fr', value: 'value fr-fr' },
        { key: 'entity.test.attribute', locale: 'en', value: 'value en-us' },
      ]);
    });
  });

  describe('#hydrateAirtableObject', () => {
    it('should set translated fields into the object', () => {
      // given
      const entity = {
        'id persistant': 'test',
        'Attribut fr-fr': 'value fr-fr initial',
        otherField: 'foo',
      };
      const translations = [
        { key: 'entity.test.attribute', locale: 'fr', value: 'value fr-fr' },
        {
          key: 'entity.test.attribute2',
          locale: 'fr',
          value: 'value2 fr-fr',
        },
        { key: 'entity.test.attribute', locale: 'en', value: 'value en-us' },
        {
          key: 'entity.test.attribute2',
          locale: 'en',
          value: 'value2 en-us',
        },
      ];

      // when
      hydrateToAirtableObject({ localizedFields, prefix })(entity, translations);

      // then
      expect(entity).to.deep.equal({
        'id persistant': 'test',
        'Attribut fr-fr': 'value fr-fr',
        'Attribut en-us': 'value en-us',
        'Attribut2 fr-fr': 'value2 fr-fr',
        'Attribut2 en-us': 'value2 en-us',
        otherField: 'foo',
      });
    });

    it('should set null value for missing translations', () => {
      // given
      const entity = {
        'id persistant': 'test',
        'Attribut fr-fr': 'value fr-fr initial',
      };
      const translations = [
        { key: 'entity.test.attribute', locale: 'en', value: 'value en-us' },
        {
          key: 'entity.test.attribute2',
          locale: 'en',
          value: 'value2 en-us',
        },
      ];

      // when
      hydrateToAirtableObject({ localizedFields, prefix })(entity, translations);

      // then
      expect(entity).to.deep.equal({
        'id persistant': 'test',
        'Attribut fr-fr': null,
        'Attribut en-us': 'value en-us',
        'Attribut2 fr-fr': null,
        'Attribut2 en-us': 'value2 en-us',
      });
    });
  });

  describe('#dehydrateAirtableObject', () => {
    it('should set translated fields into the object', () => {
      // given
      const entity = {
        'id persistant': 'test',
        'Attribut fr-fr': 'value fr-fr initial',
        'Attribut2 fr-fr': 'value2 fr-fr initial',
        otherField: 'foo',
      };

      // when
      dehydrateAirtableObject({ localizedFields })(entity);

      // then
      expect(entity).to.deep.equal({
        'id persistant': 'test',
        otherField: 'foo',
      });
    });
  });

  describe('#hydrateReleaseObject', () => {
    it('should set translated fields into the object', () => {
      // given
      const entity = {
        id: 'test',
        otherField: 'foo',
      };
      const translations = [
        { key: 'entity.test.attribute', locale: 'fr', value: 'value fr-fr' },
        {
          key: 'entity.test.attribute2',
          locale: 'fr',
          value: 'value2 fr-fr',
        },
        { key: 'entity.test.attribute', locale: 'en', value: 'value en-us' },
        {
          key: 'entity.test.attribute2',
          locale: 'en',
          value: 'value2 en-us',
        },
      ];

      // when
      hydrateReleaseObject({ fields, locales, prefix })(entity, translations);

      // then
      expect(entity).to.deep.equal({
        id: 'test',
        attribute_i18n: {
          fr: 'value fr-fr',
          en: 'value en-us',
        },
        attribute2_i18n: {
          fr: 'value2 fr-fr',
          en: 'value2 en-us',
        },
        otherField: 'foo',
      });
    });

    it('should set null value for missing translations', () => {
      // given
      const entity = {
        id: 'test',
        otherField: 'foo',
      };
      const translations = [
        { key: 'entity.test.attribute', locale: 'en', value: 'value en-us' },
        {
          key: 'entity.test.attribute2',
          locale: 'en',
          value: 'value2 en-us',
        },
      ];

      // when
      hydrateReleaseObject({ fields, locales, prefix })(entity, translations);

      // then
      expect(entity).to.deep.equal({
        id: 'test',
        attribute_i18n: {
          fr: null,
          en: 'value en-us',
        },
        attribute2_i18n: {
          fr: null,
          en: 'value2 en-us',
        },
        otherField: 'foo',
      });
    });
  });

  describe('#prefixFor', () => {
    it('should return the prefix for entity fields keys', () => {
      // given
      const entity = {
        'mon id': 'rec123',
      };

      // when
      const entityPrefix = prefixFor({ prefix, idField: 'mon id' })(entity);

      // then
      expect(entityPrefix).toBe('entity.rec123.');
    });
  });

  describe('#extractFromReleaseObject', () => {
    it('should return translations from release object', () => {
      // given
      const entity = {
        id: 'test',
        attribute_i18n: {
          fr: 'value fr-fr',
          en: 'value en-us',
        },
        attribute2_i18n: {
          fr: 'value2 fr-fr',
          en: 'value2 en-us',
        },
        otherField: 'foo',
      };

      // when
      const translations = extractFromReleaseObject({ localizedFields, prefix })(entity);

      // then
      expect(translations).to.deep.equal([
        { key: 'entity.test.attribute', locale: 'fr', value: 'value fr-fr' },
        { key: 'entity.test.attribute', locale: 'en', value: 'value en-us' },
        {
          key: 'entity.test.attribute2',
          locale: 'fr',
          value: 'value2 fr-fr',
        },
        {
          key: 'entity.test.attribute2',
          locale: 'en',
          value: 'value2 en-us',
        },
      ]);

    });
  });
});
