import { describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import * as config from '../../../../lib/config.js';

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

  describe('#url', () => {
    it('returns URL to run module', () => {
      // given
      const module = domainBuilder.buildModule({ shortId: 'abcd1234', slug: 'poueeeeeeet' });
      vi.spyOn(config.pixApp.production, 'baseUrlFr', 'get').mockReturnValue('https://enorme-en-prod.fr');

      // when
      const { url } = module;

      // then
      expect(url).toBe('https://enorme-en-prod.fr/modules/abcd1234/poueeeeeeet');
    });
  });

  describe('#previewUrl', () => {
    it('returns URL to run module', () => {
      // given
      const module = domainBuilder.buildModule({ shortId: 'abcd1234', slug: 'poueeeeeeet' });
      vi.spyOn(config.pixApp.production, 'baseUrlFr', 'get').mockReturnValue('https://enorme-en-prod.fr');

      // when
      const { previewUrl } = module;

      // then
      expect(previewUrl).toBe('https://enorme-en-prod.fr/modules/preview/abcd1234/poueeeeeeet');
    });
  });

  describe('#toModuleValidation', () => {
    it('serializes module fields to module JSON discarding irrelevant fields', () => {
      // given
      const module = domainBuilder.buildModule();
      const expectedModuleValidation = {
        id: module.id,
        details: module.details,
        glossary: module.glossary,
        isBeta: module.isBeta,
        sections: module.sections,
        shortId: module.shortId,
        slug: module.slug,
        title: module.title,
        visibility: module.visibility,
      };

      // when
      const result = module.toModuleValidation();

      // then
      expect(result).to.deep.equal(expectedModuleValidation);
    });
  });

  describe('#validate', () => {
    describe('when module is valid', () => {
      it('returns an object with an attribute "validationStatus" with value "true" and an empty errors array', async () => {
        // given
        const moduleToValidate = domainBuilder.buildModule();
        const moduleA = domainBuilder.buildModule();
        const moduleB = domainBuilder.buildModule();
        const modules = [
          moduleToValidate,
          moduleA,
          moduleB,
        ];

        // when
        const result = await moduleToValidate.validate({ modules });

        // then
        expect(result).toEqual({ validationStatus: true, validationErrors: [] });
      });
    });

    describe('when module is not valid', () => {
      it('returns an object with an attribute "validationStatus" with value "false" and errors array not empty', async () => {
        // given
        const moduleA = domainBuilder.buildModule({ shortId: 'abcd1234', slug: 'module-a' });
        const moduleB = domainBuilder.buildModule({ shortId: 'efgh1234', slug: 'module-b' });

        const moduleToValidate = domainBuilder.buildModule({ shortId: 'abcd1234' });
        Reflect.deleteProperty(moduleToValidate, 'slug');

        const modules = [
          moduleToValidate,
          moduleA,
          moduleB,
        ];

        // when
        const result = await moduleToValidate.validate({ modules });

        // then
        expect(result).toEqual({
          validationStatus: false,
          validationErrors: [
            { message: '"slug" est requis', isSchemaError: true },
            {
              message: 'Le brouillon a des ids dupliqués : cfaefec9-e185-43b8-8258-e8beff6dd77b, 9de10c46-df0e-41f5-a709-81637f0d5cc3, d5e779ec-2a5e-4692-ac46-5be5a49f2acd',
              isSchemaError: false,
            },
          ],
        });
      });
    });
  });
});
