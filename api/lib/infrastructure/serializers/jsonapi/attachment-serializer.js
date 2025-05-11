import Jsonapi from 'jsonapi-serializer';

const { Serializer } = Jsonapi;

const serializer = new Serializer('attachment', {
  attributes: [
    'filename',
    'size',
    'url',
    'mimeType',
    'type',
    'alt',
    'localizedChallengeId',
    'challenge',
  ],
  transform({ id, filename, size, url, mimeType, type, alt, localizedChallengeId, airtableChallengeId }) {
    return {
      id,
      filename,
      size,
      url,
      mimeType,
      type,
      alt,
      localizedChallengeId,
      challenge: { id: airtableChallengeId },
    };
  },
  challenge: {
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
    localizedChallengeId: data.attributes['localized-challenge-id'],
    airtableChallengeId: data.relationships.challenge.data.id,
  };
}
