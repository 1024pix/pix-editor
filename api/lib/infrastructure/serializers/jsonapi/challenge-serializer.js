import JsonapiSerializer from 'jsonapi-serializer';
import { Challenge, LocalizedChallenge } from '../../../domain/models/index.js';
import { getCountryCode } from '../../../domain/models/Geography.js';

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
    'urlsToConsult',
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
    'illustrationAlt',
    'requireGafamWebsiteAccess',
    'isIncompatibleIpadCertif',
    'deafAndHardOfHearing',
    'isAwarenessChallenge',
    'toRephrase',
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
    illustrationAlt,
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
        illustrationAlt,
      },
    };
    challenge.files = challenge.files?.map((fileId) => ({ fileId, localizedChallengeId: challenge.id }));
    return challenge;
  }
});

export function deserialize(challengeBody) {
  return new Promise((resolve, reject) => {

    deserializer.deserialize(challengeBody, (err, challengeObject) => {
      challengeObject.localizedChallenges = [LocalizedChallenge.buildPrimary({
        challengeId: challengeObject.id,
        locale: Challenge.getPrimaryLocale(challengeObject.locales),
        embedUrl: challengeObject.embedUrl,
        geography: getCountryCode(challengeObject.geography),
        urlsToConsult: challengeObject.urlsToConsult,
        requireGafamWebsiteAccess: challengeObject.requireGafamWebsiteAccess,
        isIncompatibleIpadCertif: challengeObject.isIncompatibleIpadCertif,
        deafAndHardOfHearing: challengeObject.deafAndHardOfHearing,
        isAwarenessChallenge: challengeObject.isAwarenessChallenge,
        toRephrase: challengeObject.toRephrase,
      })];
      return err ? reject(err) : resolve(new Challenge(challengeObject));
    });
  });
}
