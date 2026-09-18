import JsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = JsonapiSerializer;

const serializer = new Serializer('broken-urls', {
  attributes: [
    'url',
    'statusCode',
    'errorMessage',
    'localizedChallenges',
    'skills',
    'tutorials',
    'frameworks',
  ],
  transform({ localizedChallengeIds, skillIds, tutorialIds, frameworkNames, ...brokenUrl }) {
    return {
      ...brokenUrl,
      localizedChallenges: localizedChallengeIds.map((id) => ({ id })),
      skills: skillIds.map((id) => ({ id })),
      tutorials: tutorialIds.map((id) => ({ id })),
      frameworks: frameworkNames,
    };
  },
  localizedChallenges: { ref: 'id' },
  skills: { ref: 'id' },
  tutorials: { ref: 'id' },
});

export function serialize(brokenUrl) {
  return serializer.serialize(brokenUrl);
}
