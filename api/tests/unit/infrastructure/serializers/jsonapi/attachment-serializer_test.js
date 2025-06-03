import { describe, describe as context, expect, it } from 'vitest';
import {
  deserializeCreationCommand,
  deserializeQuery,
  deserializeUpdateCommand,
  serialize,
} from '../../../../../lib/infrastructure/serializers/jsonapi/attachment-serializer.js';
import { domainBuilder } from '../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | attachment-serializer', () => {
  describe('#deserializeCreationCommand', () => {
    it('should deserialize payload into an attachment creation command when relationship is localized challenge', () => {
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
          },
          relationships: {
            'localized-challenge': {
              data: {
                type: 'localized-challenges',
                id: 'localizedChallenge123',
              },
            },
            challenge: {
              data: null,
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
        localizedChallengeId: 'localizedChallenge123',
        challengeId: null,
      });
    });
    it('should deserialize payload into an attachment creation command when relationship is challenge', () => {
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
          },
          relationships: {
            challenge: {
              data: {
                type: 'challenges',
                id: 'challenge123',
              },
            },
            'localized-challenge': {
              data: null,
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
        localizedChallengeId: null,
        challengeId: 'challenge123',
      });
    });
  });

  describe('#deserializeUpdateCommand', () => {
    it('should deserialize payload into an attachment update command when relationship is localized challenge', () => {
      // Given
      const payload = {
        data: {
          type: 'attachments',
          id: 'recABC123',
          attributes: {
            filename: 'some filename',
            size: 123,
            url: 'some.url.com',
            type: 'some type',
            'mime-type': 'some mime type',
          },
          relationships: {
            'localized-challenge': {
              data: {
                type: 'localized-challenges',
                id: 'localizedChallenge123',
              },
            },
            challenge: {
              data: null,
            },
          },
        },
      };

      const updateCommand = deserializeUpdateCommand(payload);

      expect(updateCommand).toStrictEqual({
        id: 'recABC123',
        filename: 'some filename',
        size: 123,
        url: 'some.url.com',
        type: 'some type',
        mimeType: 'some mime type',
        localizedChallengeId: 'localizedChallenge123',
        challengeId: null,
      });
    });
    it('should deserialize payload into an attachment update command when relationship is challenge', () => {
      // Given
      const payload = {
        data: {
          type: 'attachments',
          id: 'recABC123',
          attributes: {
            filename: 'some filename',
            size: 123,
            url: 'some.url.com',
            type: 'some type',
            'mime-type': 'some mime type',
          },
          relationships: {
            challenge: {
              data: {
                type: 'challenges',
                id: 'challenge123',
              },
            },
            'localized-challenge': {
              data: null,
            },
          },
        },
      };

      const updateCommand = deserializeUpdateCommand(payload);

      expect(updateCommand).toStrictEqual({
        id: 'recABC123',
        filename: 'some filename',
        size: 123,
        url: 'some.url.com',
        type: 'some type',
        mimeType: 'some mime type',
        localizedChallengeId: null,
        challengeId: 'challenge123',
      });
    });
  });

  describe('#deserializeQuery', () => {
    it('should deserialize query', () => {
      // Given
      const query = { 'filter[localizedChallengeId]': 'loc1Id' };

      const deserializedQuery = deserializeQuery(query);

      expect(deserializedQuery).toStrictEqual({
        localizedChallengeId: 'loc1Id',
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
        });

        const serializedAttachment = serialize(attachment);

        expect(serializedAttachment.data.type).toEqual('attachments');
        expect(serializedAttachment.data.id).toEqual('attachmentId');
        expect(serializedAttachment.data.attributes).toStrictEqual({
          filename: 'some filename',
          size: 123,
          url: 'some.url.com',
          type: 'some type',
          'mime-type': 'some mime type',
        });
      });
      context('relationships', function() {
        it('should return a json with a filled with both challenge and localized challenge relationships when attachment is related to primary challenge (hence, localizedChallengeId and challengeId are the same)', function() {
          // given
          const attachment = domainBuilder.buildAttachment({
            id: 'attachmentId',
            filename: 'some filename',
            size: 123,
            url: 'some.url.com',
            type: 'some type',
            mimeType: 'some mime type',
            localizedChallengeId: 'challenge123',
            challengeId: 'challenge123',
          });

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
              },
              relationships: {
                challenge: {
                  data: {
                    type: 'challenges',
                    id: 'challenge123',
                  },
                },
                'localized-challenge': {
                  data: {
                    type: 'localized-challenges',
                    id: 'challenge123',
                  },
                },
              },
            },
          });
        });
        it('should return a json with a filled with localized challenge relationship only when attachment is related to localized challenge (hence, localizedChallengeId and challengeId are NOT the same)', function() {
          // given
          const attachment = domainBuilder.buildAttachment({
            id: 'attachmentId',
            filename: 'some filename',
            size: 123,
            url: 'some.url.com',
            type: 'some type',
            mimeType: 'some mime type',
            localizedChallengeId: 'challenge123FR',
            challengeId: 'challenge123',
          });

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
              },
              relationships: {
                challenge: {
                  data: null,
                },
                'localized-challenge': {
                  data: {
                    type: 'localized-challenges',
                    id: 'challenge123FR',
                  },
                },
              },
            },
          });
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
                },
                relationships: {
                  'localized-challenge': {
                    data: {
                      type: 'localized-challenges',
                      id: 'locId123',
                    },
                  },
                  challenge: {
                    data: null,
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
                },
                relationships: {
                  'localized-challenge': {
                    data: {
                      type: 'localized-challenges',
                      id: 'locId456',
                    },
                  },
                  challenge: {
                    data: null,
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
