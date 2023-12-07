import { beforeEach, describe, expect, it } from 'vitest';

import { buildTranslationsUtils } from '../../../../lib/infrastructure/translations/utils.js';

describe('Unit | Infrastructure | Entity translations', () => {
  const fields = [
    { airtableField: 'Attribut', field: 'attribute' },
    { airtableField: 'Attribut2', field: 'attribute2' },
  ];

  const locales = [
    { airtableLocale: 'fr-fr', locale: 'fr' },
    { airtableLocale: 'en-us', locale: 'en' },
  ];

  const prefix = 'entity.';
  const idField = 'mon id';

  let translationsUtils;

  beforeEach(() => {
    translationsUtils = buildTranslationsUtils({ fields, locales, prefix, idField });
  });

  describe('#extractFromProxyObject', () => {
    it('should return the list of translations', () => {
      // given
      const entity = {
        'mon id': 'test',
        'Attribut fr-fr': 'value fr-fr',
        'Attribut en-us': 'value en-us',
        'Attribut2 fr-fr': 'value2 fr-fr',
        'Attribut2 en-us': 'value2 en-us',
      };

      // when
      const translations = translationsUtils.extractFromProxyObject(entity);

      // then
      expect(translations).to.deep.equal([
        { key: 'entity.test.attribute', locale: 'fr', value: 'value fr-fr' },
        { key: 'entity.test.attribute2', locale: 'fr', value: 'value2 fr-fr' },
        { key: 'entity.test.attribute', locale: 'en', value: 'value en-us' },
        { key: 'entity.test.attribute2', locale: 'en', value: 'value2 en-us' },
      ]);
    });

    it('should return translations only for field w/ values', () => {
      // given
      const entity = {
        'mon id': 'test',
        'Attribut fr-fr': 'value fr-fr',
        'Attribut en-us': 'value en-us',
      };

      // when
      const translations = translationsUtils.extractFromProxyObject(entity);

      // then
      expect(translations).to.deep.equal([
        { key: 'entity.test.attribute', locale: 'fr', value: 'value fr-fr' },
        { key: 'entity.test.attribute', locale: 'en', value: 'value en-us' },
      ]);
    });
  });

  describe('#airtableObjectToProxyObject', () => {
    it('should set translated fields into the object', () => {
      // given
      const airtableObject = {
        'mon id': 'test',
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
      const proxyObject = translationsUtils.airtableObjectToProxyObject(airtableObject, translations);

      // then
      expect(proxyObject).to.deep.equal({
        'mon id': 'test',
        'Attribut fr-fr': 'value fr-fr',
        'Attribut en-us': 'value en-us',
        'Attribut2 fr-fr': 'value2 fr-fr',
        'Attribut2 en-us': 'value2 en-us',
        otherField: 'foo',
      });

      expect(airtableObject).to.deep.equal({
        'mon id': 'test',
        'Attribut fr-fr': 'value fr-fr initial',
        otherField: 'foo',
      });
    });

    it('should set null value for missing translations', () => {
      // given
      const airtableObject = {
        'mon id': 'test',
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
      const proxyObject = translationsUtils.airtableObjectToProxyObject(airtableObject, translations);

      // then
      expect(proxyObject).to.deep.equal({
        'mon id': 'test',
        'Attribut fr-fr': null,
        'Attribut en-us': 'value en-us',
        'Attribut2 fr-fr': null,
        'Attribut2 en-us': 'value2 en-us',
      });

      expect(airtableObject).to.deep.equal({
        'mon id': 'test',
        'Attribut fr-fr': 'value fr-fr initial',
      });
    });
  });

  describe('#proxyObjectToAirtableObject', () => {
    it('should return an airtable object', () => {
      // given
      const proxyObject = {
        'mon id': 'test',
        'Attribut fr-fr': 'value fr-fr initial',
        'Attribut2 fr-fr': 'value2 fr-fr initial',
        otherField: 'foo',
      };

      // when
      const airtableObject = translationsUtils.proxyObjectToAirtableObject(proxyObject);

      // then
      expect(airtableObject).to.deep.equal({
        'mon id': 'test',
        otherField: 'foo',
      });

      expect(proxyObject).to.deep.equal({
        'mon id': 'test',
        'Attribut fr-fr': 'value fr-fr initial',
        'Attribut2 fr-fr': 'value2 fr-fr initial',
        otherField: 'foo',
      });
    });
  });

  describe('#toDomain', () => {
    it('should return i18n fields for domain object', () => {
      // given
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
        { key: 'entity.test.attribute', locale: 'nl', value: 'value nl-be' },
        { key: 'entity.test.attribute2', locale: 'nl', value: 'value2 nl-be' },
      ];

      // when
      const i18nFields = translationsUtils.toDomain(translations);

      // then
      expect(i18nFields).to.deep.equal({
        attribute_i18n: {
          fr: 'value fr-fr',
          en: 'value en-us',
          nl: 'value nl-be',
        },
        attribute2_i18n: {
          fr: 'value2 fr-fr',
          en: 'value2 en-us',
          nl: 'value2 nl-be',
        },
      });
    });

    it('should return null fields for missing translations in given locales', () => {
      // given
      const translations = [
        { key: 'entity.test.attribute', locale: 'en', value: 'value en-us' },
        {
          key: 'entity.test.attribute2',
          locale: 'en',
          value: 'value2 en-us',
        },
      ];

      // when
      const domainObject = translationsUtils.toDomain(translations);

      // then
      expect(domainObject).to.deep.equal({
        attribute_i18n: {
          fr: null,
          en: 'value en-us',
        },
        attribute2_i18n: {
          fr: null,
          en: 'value2 en-us',
        },
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
      const entityPrefix = translationsUtils.prefixFor(entity);

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
      const translations = translationsUtils.extractFromReleaseObject(entity);

      // then
      expect(translations).to.deep.equal([
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
      ]);
    });
  });
});
