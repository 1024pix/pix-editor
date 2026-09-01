import JsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = JsonapiSerializer;

const serializer = new Serializer('broken-urls', {
  attributes: [
    'url',
    'statusCode',
    'errorMessage',
    'localizedChallenges',
    'skills',
  ],
  transform({ localizedChallengeIds, skillIds, ...brokenUrl }) {
    return {
      ...brokenUrl,
      localizedChallenges: localizedChallengeIds.map((id) => ({ id })),
      skills: skillIds.map((id) => ({ id })),
    };
  },
  localizedChallenges: { ref: 'id' },
  skills: { ref: 'id' },
});

export function serialize(brokenUrl) {
  return serializer.serialize(brokenUrl);
}
