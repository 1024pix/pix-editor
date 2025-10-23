import { beforeEach, describe, expect, it } from 'vitest';

import { buildTranslationsUtils } from '../../../../lib/infrastructure/translations/utils.js';

describe('Unit | Infrastructure | Entity translations', () => {
  const fields = [{ field: 'attribute' }, { field: 'attribute2' }];

  const locales = [{ locale: 'fr' }, { locale: 'en' }];

  const prefix = 'entity.';

  let translationsUtils;

  beforeEach(() => {
    translationsUtils = buildTranslationsUtils({ fields, locales, prefix });
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
