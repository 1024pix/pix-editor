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
});
