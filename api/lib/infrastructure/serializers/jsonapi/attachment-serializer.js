import Jsonapi from 'jsonapi-serializer';
import { extractParameters } from '../../utils/query-params-utils.js';

const { Serializer } = Jsonapi;

const serializer = new Serializer('attachment', {
  attributes: [
    'filename',
    'size',
    'url',
    'mimeType',
    'type',
    'challenge',
    'localizedChallenge',
  ],
  typeForAttribute(attribute) {
    if (attribute === 'localizedChallenge') return 'localized-challenges';
  },
  transform({ id, filename, size, url, mimeType, type, localizedChallengeId, challengeId }) {
    return {
      id,
      filename,
      size,
      url,
      mimeType,
      type,
      challenge: { id: challengeId },
      localizedChallenge: { id: localizedChallengeId },
    };
  },
  challenge: {
    ref: 'id',
  },
  localizedChallenge: {
    ref: 'id',
  },
});

export function serialize(attachments) {
  return serializer.serialize(attachments);
}

export function deserializeCreationCommand({ data }) {
  return {
    filename: data.attributes.filename,
    size: parseInt(data.attributes.size),
    url: data.attributes.url,
    mimeType: data.attributes['mime-type'],
    type: data.attributes.type,
    localizedChallengeId: data.relationships?.['localized-challenge']?.data?.id ?? null,
    challengeId: data.relationships?.challenge?.data?.id ?? null,
  };
}

export function deserializeUpdateCommand({ data }) {
  return {
    ...deserializeCreationCommand({ data }),
    id: data.id,
  };
}

export function deserializeQuery(query) {
  const extractedParams = extractParameters(query);
  return {
    localizedChallengeId: extractedParams.filter.localizedChallengeId,
  };
}
