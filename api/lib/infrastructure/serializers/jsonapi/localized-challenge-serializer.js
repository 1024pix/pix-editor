import JsonapiSerializer from 'jsonapi-serializer';
import Inflector from 'inflected';
import { LocalizedChallenge } from '../../../domain/models/index.js';
import { getCountryCode, getCountryName } from '../../../domain/models/Geography.js';

const { Serializer, Deserializer } = JsonapiSerializer;

const serializer = new Serializer('localized-challenges', {
  attributes: [
    'challenge',
    'locale',
    'embedUrl',
    'defaultEmbedUrl',
    'geography',
    'urlsToConsult',
    'status',
    'fileIds',
    'translations',
  ],
  typeForAttribute(attribute) {
    if (attribute === 'fileIds') return 'attachments';
  },
  keyForAttribute(attribute) {
    if (attribute === 'fileIds') return 'files';
    return Inflector.dasherize(Inflector.underscore(attribute));
  },
  challenge: {
    ref: 'id',
    included: false,
  },
  fileIds: {
    ref(_, fileId) {
      return fileId;
    }
  },
  transform: function({ challengeId, defaultEmbedUrl, ...localizedChallenge }) {
    return {
      ...localizedChallenge,
      defaultEmbedUrl,
      challenge: { id: challengeId },
      translations: `/api/challenges/${challengeId}/translations/${localizedChallenge.locale}`,
      geography: getCountryName(localizedChallenge.geography),
    };
  }
});

export function serialize(localizedChallenge) {
  return serializer.serialize(localizedChallenge);
}

const deserializer = new Deserializer({
  keyForAttribute: 'camelCase',
  challenges: {
    valueForRelationship(challenge) {
      return challenge.id;
    },
  },
  attachments: {
    valueForRelationship(attachment) {
      return attachment.id;
    }
  },
  transform: function({ challenge, embedUrl, files, ...localizedChallenge }) {
    return new LocalizedChallenge({
      ...localizedChallenge,
      challengeId: challenge,
      embedUrl: embedUrl === '' ? null : embedUrl,
      fileIds: files,
    });
  }
});

export async function deserialize(localizedChallengeBody) {
  return new Promise((resolve, reject) => {

    deserializer.deserialize(localizedChallengeBody, (err, localizedChallengeObject) => {
      localizedChallengeObject.geography = getCountryCode(localizedChallengeObject.geography);
      return err ? reject(err) : resolve(new LocalizedChallenge(localizedChallengeObject));
    });
  });
}
