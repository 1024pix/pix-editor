import { describe, describe as context, expect, it } from 'vitest';
import {
  deserializeCreationCommand,
  deserializeQuery,
  serialize,
} from '../../../../../lib/infrastructure/serializers/jsonapi/attachment-serializer.js';
import { domainBuilder } from '../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | attachment-serializer', () => {
  describe('#deserializeCreationCommand', () => {
    it('should deserialize payload into an attachment creation command', () => {
      // Given
      const payload = {
        data: {
          type: 'attachments',
          attributes: {
            filename: 'some filename',
            size: 123,
            url: 'some.url.com',
            type: 'some type',
            'mime-type': 'some mime type',
            'localized-challenge-id': 'locId123',
          },
          relationships: {
            challenge: {
              data: {
                type: 'challenges',
                id: 'challenge123'
              },
            },
          },
        },
      };

      const creationCommand = deserializeCreationCommand(payload);

      expect(creationCommand).toStrictEqual({
        filename: 'some filename',
        size: 123,
        url: 'some.url.com',
        type: 'some type',
        mimeType: 'some mime type',
        localizedChallengeId: 'locId123',
        airtableChallengeId: 'challenge123',
      });
    });
  });

  describe('#deserializeQuery', () => {
    it('should deserialize query', () => {
      // Given
      const query = { 'filter[localizedChallengeIds]': 'loc1Id,loc2Id' };

      const deserializedQuery = deserializeQuery(query);

      expect(deserializedQuery).toStrictEqual({
        localizedChallengeIds: ['loc1Id', 'loc2Id'],
      });
    });
  });

  describe('#serialize', function() {
    context('when serializing one entity', function() {
      it('should return a json for one serialized entity', function() {
        // given
        const attachment = domainBuilder.buildAttachment({
          id: 'attachmentId',
          filename: 'some filename',
          size: 123,
          url: 'some.url.com',
          type: 'some type',
          mimeType: 'some mime type',
          localizedChallengeId: 'locId123',
          challengeId: 'challenge123',
          alt: 'coucou les zamis',
        });
        attachment.airtableChallengeId = 'airtableChallenge123';

        const serializedAttachment = serialize(attachment);

        expect(serializedAttachment).toStrictEqual({
          data: {
            type: 'attachments',
            id: 'attachmentId',
            attributes: {
              filename: 'some filename',
              size: 123,
              url: 'some.url.com',
              type: 'some type',
              'mime-type': 'some mime type',
              alt: 'coucou les zamis',
              'localized-challenge-id': 'locId123',
            },
            relationships: {
              challenge: {
                data: {
                  type: 'challenges',
                  id: 'airtableChallenge123',
                },
              },
            },
          },
        });
      });
    });
    context('when serializing several entities', function() {
      it('should return a json for several serialized entities', function() {
        // given
        const attachment1 = domainBuilder.buildAttachment({
          id: 'attachmentId1',
          filename: 'some filename1',
          size: 123,
          url: 'some.url.com1',
          type: 'some type1',
          mimeType: 'some mime type1',
          localizedChallengeId: 'locId123',
          challengeId: 'challenge123',
          alt: 'coucou les zamis1',
        });
        attachment1.airtableChallengeId = 'airtableChallenge123';
        const attachment2 = domainBuilder.buildAttachment({
          id: 'attachmentId2',
          filename: 'some filename2',
          size: 456,
          url: 'some.url.com2',
          type: 'some type2',
          mimeType: 'some mime type2',
          localizedChallengeId: 'locId456',
          airtableChallengeId: 'challenge456',
          alt: 'coucou les zamis2',
        });
        attachment2.airtableChallengeId = 'airtableChallenge456';

        const serializedAttachments = serialize([attachment1, attachment2]);

        expect(serializedAttachments).toStrictEqual(
          {
            data: [
              {
                type: 'attachments',
                id: 'attachmentId1',
                attributes: {
                  filename: 'some filename1',
                  size: 123,
                  url: 'some.url.com1',
                  type: 'some type1',
                  'mime-type': 'some mime type1',
                  'localized-challenge-id': 'locId123',
                  alt: 'coucou les zamis1',
                },
                relationships: {
                  challenge: {
                    data: {
                      type: 'challenges',
                      id: 'airtableChallenge123',
                    },
                  },
                },
              },
              {
                type: 'attachments',
                id: 'attachmentId2',
                attributes: {
                  filename: 'some filename2',
                  size: 456,
                  url: 'some.url.com2',
                  type: 'some type2',
                  'mime-type': 'some mime type2',
                  'localized-challenge-id': 'locId456',
                  alt: 'coucou les zamis2',
                },
                relationships: {
                  challenge: {
                    data: {
                      type: 'challenges',
                      id: 'airtableChallenge456',
                    },
                  },
                },
              },
            ],
          },
        );
      });
    });
  });
});
