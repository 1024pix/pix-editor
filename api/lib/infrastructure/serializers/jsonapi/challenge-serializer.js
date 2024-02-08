import JsonapiSerializer from 'jsonapi-serializer';
import { Challenge } from '../../../domain/models/Challenge.js';

const { Serializer, Deserializer } = JsonapiSerializer;

const serializer = new Serializer('challenges', {
  attributes: [
    'airtableId',
    'instruction',
    'alternativeInstruction',
    'type',
    'format',
    'proposals',
    'solution',
    'solutionToDisplay',
    't1Status',
    't2Status',
    't3Status',
    'pedagogy',
    'author',
    'declinable',
    'version',
    'genealogy',
    'status',
    'preview',
    'timer',
    'embedUrl',
    'embedTitle',
    'embedHeight',
    'alternativeVersion',
    'accessibility1',
    'accessibility2',
    'spoil',
    'responsive',
    'locales',
    'alternativeLocales',
    'geography',
    'autoReply',
    'focusable',
    'skill',
    'files',
    'updatedAt',
    'validatedAt',
    'archivedAt',
    'madeObsoleteAt',
    'shuffled',
    'contextualizedFields',
    'localizedChallenges',
  ],
  typeForAttribute(attribute) {
    if (attribute === 'files') return 'attachments';
    if (attribute === 'localizedChallenges') return 'localized-challenges';
  },
  skill: {
    ref(challenge, skillId) {
      return skillId;
    }
  },
  files: {
    ref(challenge, fileId) {
      return fileId;
    }
  },
  localizedChallenges: {
    ref: 'id',
    included: false,
  },
  transform(challenge) {
    challenge.preview = `/api/challenges/${challenge.id}/preview`;
    challenge.skill = challenge.skills[0];
    return challenge;
  }
});

export function serialize(challenge) {
  return serializer.serialize(challenge);
}

const deserializer = new Deserializer({
  keyForAttribute: 'camelCase',
  skills: {
    valueForRelationship(skill) {
      return skill.id;
    },
  },
  attachments: {
    valueForRelationship(attachment) {
      return attachment.id;
    },
  },
  transform({
    skill,
    instruction,
    alternativeInstruction,
    proposals,
    solution,
    solutionToDisplay,
    embedTitle,
    ...challenge
  }) {
    challenge.skills = skill ? [skill] : [];
    challenge.translations = {
      [Challenge.getPrimaryLocale(challenge.locales)]: {
        instruction,
        alternativeInstruction,
        proposals,
        solution,
        solutionToDisplay,
        embedTitle,
      },
    };
    challenge.files = challenge.files?.map((fileId) => ({ fileId, localizedChallengeId: challenge.id }));
    return challenge;
  }
});

export function deserialize(challengeBody) {
  return new Promise((resolve, reject) => {

    deserializer.deserialize(challengeBody, (err, challengeObject) => {
      challengeObject.localizedChallenges = [{
        id: challengeObject.id,
        challengeId: challengeObject.id,
        locale: Challenge.getPrimaryLocale(challengeObject.locales),
        embedUrl: challengeObject.embedUrl,
        status: null,
      }];
      return err ? reject(err) : resolve(new Challenge(challengeObject));
    });
  });
}
