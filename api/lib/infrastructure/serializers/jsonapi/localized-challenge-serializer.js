import JsonapiSerializer from 'jsonapi-serializer';
import { dasherize, underscore } from 'inflected';
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
    return dasherize(underscore(attribute));
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
  transform: function({ challenge, embedUrl, ...localizedChallenge }) {
    return new LocalizedChallenge({
      ...localizedChallenge,
      challengeId: challenge,
      embedUrl: embedUrl === '' ? null : embedUrl,
    });
  }
});

export async function deserialize(localizedChallengeBody) {
  return deserializer.deserialize(localizedChallengeBody);
}
