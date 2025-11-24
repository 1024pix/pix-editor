import JsonapiSerializer from 'jsonapi-serializer';
import { LocalizedFrameworkTubes } from '../../../domain/models/index.js';

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

export function deserializeLocalizedFrameworkTubes(attributes) {
  return new LocalizedFrameworkTubes({
    id: attributes.id,
    tubeId: attributes['tube-id'],
    maxLevel: attributes['max-level'],
    locale: attributes.locale,
  });
}
