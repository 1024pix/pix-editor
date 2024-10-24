import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../../test-helper.js';
import { serialize } from '../../../../../lib/infrastructure/serializers/jsonapi/whitelisted-url-serializer.js';
import { WhitelistedUrl } from '../../../../../lib/domain/models/index.js';

describe('Unit | Serializer | JSONAPI | whitelisted-url-serializer', () => {
  describe('#serialize', () => {
    it('should serialize a unique WhitelistedUrl', () => {
      // Given
      const whitelistedUrl = domainBuilder.buildReadWhitelistedUrl({
        id: 123,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2022-02-02'),
        creatorName: 'Madame Admin 1',
        latestUpdatorName: 'Madame Admin 2',
        url: 'https://www.google.com',
        relatedEntityIds: 'recINswt85utqO5KJ,recPiCGFhfgervqr5',
        comment: 'Je décide de whitelister ça car mon cousin travaille chez google',
        checkType: WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
      });
      const expectedSerializedWhitelistedUrl = {
        data: {
          type: 'whitelisted-urls',
          id: '123',
          attributes: {
            'created-at': new Date('2020-01-01'),
            'updated-at': new Date('2022-02-02'),
            'creator-name': 'Madame Admin 1',
            'latest-updator-name': 'Madame Admin 2',
            'url': 'https://www.google.com',
            'related-entity-ids': 'recINswt85utqO5KJ,recPiCGFhfgervqr5',
            'comment': 'Je décide de whitelister ça car mon cousin travaille chez google',
            'check-type': 'exact_match',
          },
        }
      };
      // When
      const json = serialize(whitelistedUrl);

      // Then
      expect(json).to.deep.equal(expectedSerializedWhitelistedUrl);
    });
    it('should serialize several WhitelistedUrls', () => {
      // Given
      const whitelistedUrl1 = domainBuilder.buildReadWhitelistedUrl({
        id: 123,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2022-02-02'),
        creatorName: 'Madame Admin 1',
        latestUpdatorName: 'Madame Admin 2',
        url: 'https://www.google.com',
        relatedEntityIds: 'recINswt85utqO5KJ,recPiCGFhfgervqr5',
        comment: 'Je décide de whitelister ça car mon cousin travaille chez google',
        checkType: WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
      });
      const whitelistedUrl2 = domainBuilder.buildReadWhitelistedUrl({
        id: 456,
        createdAt: new Date('2020-12-12'),
        updatedAt: new Date('2022-08-08'),
        creatorName: null,
        latestUpdatorName: null,
        url: 'https://www.editor.pix.fr',
        relatedEntityIds: null,
        comment: 'Mon site préféré',
        checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
      });
      const expectedSerializedWhitelistedUrls = {
        data: [
          {
            type: 'whitelisted-urls',
            id: '123',
            attributes: {
              'created-at': new Date('2020-01-01'),
              'updated-at': new Date('2022-02-02'),
              'creator-name': 'Madame Admin 1',
              'latest-updator-name': 'Madame Admin 2',
              'url': 'https://www.google.com',
              'related-entity-ids': 'recINswt85utqO5KJ,recPiCGFhfgervqr5',
              'comment': 'Je décide de whitelister ça car mon cousin travaille chez google',
              'check-type': 'exact_match',
            },
          },
          {
            type: 'whitelisted-urls',
            id: '456',
            attributes: {
              'created-at': new Date('2020-12-12'),
              'updated-at': new Date('2022-08-08'),
              'creator-name': null,
              'latest-updator-name': null,
              'url': 'https://www.editor.pix.fr',
              'related-entity-ids': null,
              'comment': 'Mon site préféré',
              'check-type': 'starts_with',
            },
          },
        ],
      };
      // When
      const json = serialize([whitelistedUrl1, whitelistedUrl2]);

      // Then
      expect(json).to.deep.equal(expectedSerializedWhitelistedUrls);
    });
  });
});
