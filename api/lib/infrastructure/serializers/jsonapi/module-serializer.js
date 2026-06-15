import Jsonapi from 'jsonapi-serializer';

const { Serializer } = Jsonapi;

const defaultAttributes = [
  'internalTitle',
  'shortId',
  'slug',
  'title',
  'isBeta',
  'visibility',
  'details',
  'sections',
  'glossary',
  'draftModule',
];

export function serialize(module, { attributes = defaultAttributes, meta } = {}) {
  const serializer = new Serializer('module', {
    attributes,
    meta,
    transform({ draftModuleId, ...module }) {
      return {
        ...module,
        draftModule: draftModuleId ? { id: draftModuleId } : null,
      };
    },
    draftModule: {
      ref: 'id',
      included: false,
    },
    typeForAttribute(attribute) {
      if (attribute === 'draftModule') return 'draft-modules';
    },
  });
  return serializer.serialize(module);
}
