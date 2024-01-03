import JsonapiSerializer from 'jsonapi-serializer';
import { LocalizedChallenge } from '../../../domain/models/index.js';

const { Serializer, Deserializer } = JsonapiSerializer;

const serializer = new Serializer('localized-challenges', {
  attributes: [
    'challenge',
    'locale',
    'embedUrl',
  ],
  challenge: {
    ref: 'id',
    included: false,
  },
});

export function serialize(localizedChallenge) {
  const { challengeId, ...props } = localizedChallenge;
  return serializer.serialize({
    ...props,
    challenge: { id: challengeId },
  });
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
