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
});

export async function deserialize(localizedChallengeBody) {
  const dto = await deserializer.deserialize(localizedChallengeBody);
  return new LocalizedChallenge(dto);
}
