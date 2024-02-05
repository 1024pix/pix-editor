import JsonapiSerializer from 'jsonapi-serializer';
import Inflector from 'inflected';
import { LocalizedChallenge } from '../../../domain/models/index.js';

const { Serializer, Deserializer } = JsonapiSerializer;

const serializer = new Serializer('localized-challenges', {
  attributes: [
    'challenge',
    'locale',
    'embedUrl',
    'status',
    'fileIds',
  ],
  typeForAttribute(attribute) {
    if (attribute === 'fileIds') return 'attachments';
  },
  keyForAttribute(attribute) {
    if (attribute === 'fileIds') return 'files';
    return Inflector.dasherize(Inflector.underscore(attribute));
  },
  challenge: {
    ref: 'id',
    included: false,
  },
  fileIds: {
    ref(_, fileId) {
      return fileId;
    }
  },
  transform: function({ challengeId, ...localizedChallenge }) {
    return {
      ...localizedChallenge,
      challenge: { id: challengeId },
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
  transform: function({ challenge, embedUrl, ...localizedChallenge }) {
    return new LocalizedChallenge({
      ...localizedChallenge,
      challengeId: challenge,
      embedUrl: embedUrl === '' ? null : embedUrl,
      fileIds: localizedChallenge.files,
    });
  }
});

export async function deserialize(localizedChallengeBody) {
  return deserializer.deserialize(localizedChallengeBody);
}
