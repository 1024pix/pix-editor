import JsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = JsonapiSerializer;

const serializer = new Serializer('config', {
  attributes: [
    'airtableUrl',
    'airtableBase',
    'tableChallenges',
    'tableSkills',
    'tableTubes',
    'storagePost',
    'storageBucket',
    'localeToLanguageMap',
    'tutorialLocaleToLanguageMap',
    'llmVariationsUrl',
    'llmVariationsToken',
  ],
});

export function serialize(config) {
  return serializer.serialize(config);
}
