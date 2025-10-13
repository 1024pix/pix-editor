import JsonapiSerializer from 'jsonapi-serializer';
import Inflector from 'inflected';
import { LocalizedChallenge } from '../../../domain/models/index.js';

const { Serializer, Deserializer } = JsonapiSerializer;

const serializer = new Serializer('localized-challenges', {
  attributes: [
    'challenge',
    'locale',
    'embedUrl',
    'instruction',
    'defaultEmbedUrl',
    'geography',
    'urlsToConsult',
    'status',
    'translations',
    'requireGafamWebsiteAccess',
    'isIncompatibleIpadCertif',
    'deafAndHardOfHearing',
    'isAwarenessChallenge',
    'toRephrase',
    'hasEmbedInternalValidation',
    'noValidationNeeded',
    'attachments',
  ],
  challenge: {
    ref: 'id',
    included: false,
  },
  fileIds: {
    ref(_, fileId) {
      return fileId;
    }
  },
  attachments: {
    ref: 'id',
    ignoreRelationshipData: true,
    relationshipLinks: {
      related: function(record, current, parent) {
        return `/api/attachments?filter[localizedChallengeId]=${parent.id}`;
      },
    },
  },

  typeForAttribute(attribute) {
    if (attribute === 'attachments') return 'attachments';
  },
  keyForAttribute(attribute) {
    return Inflector.dasherize(Inflector.underscore(attribute));
  },
  transform: function({ challengeId, defaultEmbedUrl, ...localizedChallenge }) {
    return {
      ...localizedChallenge,
      defaultEmbedUrl,
      challenge: { id: challengeId },
      translations: `/api/challenges/${challengeId}/translations/${localizedChallenge.locale}`,
      attachments: [],
    };
  }
});

export function serialize(localizedChallenge) {
  return serializer.serialize(localizedChallenge);
}

const deserializer = new Deserializer({
  keyForAttribute: 'camelCase',
  challenges: {
    valueForRelationship(challenge) {
      return challenge.id;
    },
  },
  attachments: {
    valueForRelationship(attachment) {
      return attachment.id;
    }
  },
  transform: function({ challenge, embedUrl, files, ...localizedChallenge }) {
    return new LocalizedChallenge({
      ...localizedChallenge,
      challengeId: challenge,
      embedUrl: embedUrl === '' ? null : embedUrl,
      fileIds: files,
      validatedAt: null,
    });
  }
});

export async function deserialize(localizedChallengeBody) {
  return new Promise((resolve, reject) => {

    deserializer.deserialize(localizedChallengeBody, (err, localizedChallengeObject) => {
      return err ? reject(err) : resolve(new LocalizedChallenge(localizedChallengeObject));
    });
  });
}
