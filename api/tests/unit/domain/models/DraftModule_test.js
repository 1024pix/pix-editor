import { describe, expect, it, vi } from 'vitest';

import * as config from '../../../../lib/config.js';
import { DraftModule } from '../../../../lib/domain/models/index.js';
import { domainBuilder } from '../../../test-helper.js';

const uuidRegExp = /^\p{Hex_Digit}{8}-\p{Hex_Digit}{4}-\p{Hex_Digit}{4}-\p{Hex_Digit}{4}-\p{Hex_Digit}{12}$/u;
const shortIdRegExp = /^\p{Hex_Digit}{8}$/u;

describe('Unit | Domain | DraftModule', () => {
  describe('#prepareForCreation', () => {
    it('computes fields for creation', () => {
      // given
      const draftModule = new DraftModule();

      // when
      draftModule.prepareForCreation();

      // then
      expect(draftModule.id).toMatch(uuidRegExp);
      expect(draftModule.shortId).toMatch(shortIdRegExp);
      expect(draftModule.shortId).toBe(draftModule.id.slice(0, 8));
    });

    describe('when a module is given', () => {
      it('uses module’s id and shortId', () => {
        // given
        const module = domainBuilder.buildModule();
        const draftModule = new DraftModule();

        // when
        draftModule.prepareForCreation(module);

        // then
        expect(draftModule.id).toBe(module.id);
        expect(draftModule.shortId).toBe(module.shortId);
      });
    });
  });

  describe('#serializeToJSON', () => {
    it('serializes module fields to JSON discarding irrelevant fields', () => {
      // given
      const draftModule = domainBuilder.buildDraftModule({ moduleId: 'pouet' });
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
        Object.fromEntries(Object.entries(draftModule).filter(([field]) => serializedFields.includes(field))),
        null,
        2,
      );

      // when
      const json = draftModule.serializeToJSON();

      // then
      expect(json).toStrictEqual(expectedJSON);
    });
  });

  describe('#url', () => {
    it('returns URL to run draft module', () => {
      // given
      const draftModule = domainBuilder.buildDraftModule({ shortId: 'abcd1234', slug: 'poueeeeeeet' });
      vi.spyOn(config.pixApp.recette, 'baseUrlFr', 'get').mockReturnValue('https://enorme.fr');

      // when
      const { url } = draftModule;

      // then
      expect(url).toBe('https://enorme.fr/modules/abcd1234/poueeeeeeet');
    });
  });

  describe('#previewUrl', () => {
    it('returns URL to run draft module', () => {
      // given
      const draftModule = domainBuilder.buildDraftModule({ shortId: 'abcd1234', slug: 'poueeeeeeet' });
      vi.spyOn(config.pixApp.recette, 'baseUrlFr', 'get').mockReturnValue('https://enorme.fr');

      // when
      const { previewUrl } = draftModule;

      // then
      expect(previewUrl).toBe('https://enorme.fr/modules/preview/abcd1234/poueeeeeeet');
    });
  });
});
