import JsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = JsonapiSerializer;

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
