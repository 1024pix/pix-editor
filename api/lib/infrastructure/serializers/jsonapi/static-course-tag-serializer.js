import JsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = JsonapiSerializer;

export function serialize(staticCourseTag) {
  return new Serializer('static-course-tags', {
    attributes: [
      'label',
    ],
  }).serialize(staticCourseTag);
}
