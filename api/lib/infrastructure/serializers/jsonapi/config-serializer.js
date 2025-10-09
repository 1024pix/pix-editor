import JsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = JsonapiSerializer;

const serializer = new Serializer('config', {
  attributes: [
    'storagePost',
    'storageBucket',
    'localeToLanguageMap',
    'tutorialLocaleToLanguageMap',
  ],
});

export function serialize(config) {
  return serializer.serialize(config);
}
