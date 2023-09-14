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
    'storageTenant',
    'storageUser',
    'storagePassword',
    'storageKey',
    'storageAuth',
    'storageBucket',
    'localeToLanguageMap',
  ],
});

export function serialize(config) {
  return serializer.serialize(config);
}
