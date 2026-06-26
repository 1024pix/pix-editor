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
  'url',
  'previewUrl',
];

export function serialize(module, { attributes = defaultAttributes, meta } = {}) {
  const serializer = new Serializer('module', {
    attributes,
    meta,
    transform({ draftModuleId, url, previewUrl, ...module }) {
      return {
        ...module,
        url,
        previewUrl,
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
