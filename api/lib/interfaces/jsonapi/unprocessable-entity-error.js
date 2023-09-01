import _ from 'lodash';
import JsonapiSerializer from 'jsonapi-serializer';

const { Error: JSONAPIError } = JsonapiSerializer;

function _formatAttribute({ attribute, message }) {
  return {
    status: '422',
    source: {
      pointer: `/data/attributes/${ _.kebabCase(attribute) }`,
    },
    title: `Invalid data attribute "${ attribute }"`,
    detail: message
  };
}

function _formatRelationship({ attribute, message }) {
  const relashionship = attribute.replace('Id', '');
  return {
    status: '422',
    source: {
      pointer: `/data/relationships/${ _.kebabCase(relashionship) }`,
    },
    title: `Invalid relationship "${ relashionship }"`,
    detail: message
  };
}

function _formatInvalidAttribute({ attribute, message }) {
  if (attribute.endsWith('Id')) {
    return _formatRelationship({ attribute, message });
  }
  return _formatAttribute({ attribute, message });
}

export function unprocessableEntityError(invalidAttributes) {
  return new JSONAPIError(invalidAttributes.map(_formatInvalidAttribute));
}
