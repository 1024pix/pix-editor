import JsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = JsonapiSerializer;

export function serializeLocalizedFrameworkTubes(domainObject) {
  return new Serializer('localized-framework-tubes', {
    attributes: [
      'tubeId',
      'maxLevel',
      'locale',
    ],
  }).serialize(domainObject);
}
