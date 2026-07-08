import { describe, expect, it, vi } from 'vitest';

import * as config from '../../../../lib/config.js';
import { DraftModule, Module } from '../../../../lib/domain/models/index.js';
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
      expect(draftModule.version).toBe('0.1');
    });

    describe('when a module is given', () => {
      it('uses module’s id and shortId', () => {
        // given
        const module = domainBuilder.buildModule({ version: '2.0' });
        const draftModule = new DraftModule();

        // when
        draftModule.prepareForCreation(module);

        // then
        expect(draftModule.id).toBe(module.id);
        expect(draftModule.shortId).toBe(module.shortId);
        expect(draftModule.version).toBe('2.1');
      });
    });
  });

  describe('#update', () => {
    it('udpates updatable draft module’s fields', () => {
      // given
      const draftModule = domainBuilder.buildDraftModule({
        id: '704a89a6-983b-4e04-bfef-6a54f925c44e',
        shortId: '704a89a6',
        version: '10.11',
        createdAt: new Date('2026-06-29T14:04:01Z'),
        updatedAt: new Date('2026-06-29T14:04:01Z'),
      });
      const updates = domainBuilder.buildDraftModule({
        id: 'updated id',
        moduleId: 'updated moduleId',
        shortId: 'updated shortId',
        details: 'updated details',
        glossary: 'updated glossary',
        internalTitle: 'updated internalTitle',
        isBeta: 'updated isBeta',
        sections: 'updated sections',
        slug: 'updated slug',
        title: 'updated title',
        visibility: 'updated visibility',
      });

      // when
      draftModule.update(updates);

      // then
      expect(draftModule).toStrictEqual(domainBuilder.buildDraftModule({
        id: '704a89a6-983b-4e04-bfef-6a54f925c44e',
        shortId: '704a89a6',
        createdAt: new Date('2026-06-29T14:04:01Z'),
        updatedAt: new Date('2026-06-29T14:04:01Z'),
        details: 'updated details',
        glossary: 'updated glossary',
        internalTitle: 'updated internalTitle',
        isBeta: 'updated isBeta',
        sections: 'updated sections',
        slug: 'updated slug',
        title: 'updated title',
        visibility: 'updated visibility',
        version: '10.12',
      }));
    });
  });

  describe('#publish', () => {
    it('creates a published module from draft module', () => {
      // given
      const draftModule = domainBuilder.buildDraftModule({ version: '0.341' });
      const expectedModule = new Module({
        id: draftModule.id,
        details: draftModule.details,
        glossary: draftModule.glossary,
        internalTitle: draftModule.internalTitle,
        isBeta: draftModule.isBeta,
        sections: draftModule.sections,
        shortId: draftModule.shortId,
        slug: draftModule.slug,
        title: draftModule.title,
        visibility: draftModule.visibility,
        version: '1.0',
      });

      // when
      const publishedModule = draftModule.publish();

      // then
      expect(publishedModule).toStrictEqual(expectedModule);
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
