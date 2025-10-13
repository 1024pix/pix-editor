import JsonapiSerializer from 'jsonapi-serializer';
import { Challenge, LocalizedChallenge } from '../../../domain/models/index.js';

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
    'hasEmbedInternalValidation',
    'noValidationNeeded',
    'attachments',
    'challengeLocales',
  ],
  typeForAttribute(attribute) {
    if (attribute === 'localizedChallenges') return 'localized-challenges';
    if (attribute === 'localizedChallenge') return 'localized-challenges';
    if (attribute === 'attachments') return 'attachments';
    if (attribute === 'challengeLocales') return 'challenge-locales';
  },
  skill: {
    ref(challenge, skillId) {
      return skillId;
    }
  },
  localizedChallenges: {
    ref: 'id',
    included: false,
  },
  attachments: {
    ref: 'id',
    ignoreRelationshipData: true,
    relationshipLinks: {
      related: function(record, current, parent) {
        return `/api/attachments?filter[localizedChallengeId]=${parent.id}`;
      },
    },
  },
  challengeLocales: {
    ref: 'id',
    included: true,
    attributes: [
      'locale',
      'localizedChallenge',
    ],
    localizedChallenge: {
      ref: 'id',
      included: false,
    },
  },
  transform(challenge) {
    challenge.preview = `/api/challenges/${challenge.id}/preview`;
    challenge.skill = challenge.skills[0];
    challenge.attachments = [];
    challenge.challengeLocales = LocalizedChallenge.SUPPORTED_LOCALES.map((locale) => {
      const localizedChallenge = challenge.localizedChallenges.find((localizedChallenge) => localizedChallenge.locale === locale);
      return {
        id: `${challenge.id}-${locale}`,
        locale,
        localizedChallenge: {
          id: localizedChallenge?.id,
        },
      };
    });
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
    attachments,
    ...challenge
  }) {
    return new Challenge({
      ...challenge,
      skills: skill ? [skill] : [],
      files: attachments?.map((fileId) => ({ fileId, localizedChallengeId: challenge.id })),
      localizedChallenges:  [LocalizedChallenge.buildPrimary({
        challengeId: challenge.id,
        locale: Challenge.getPrimaryLocale(challenge.locales),
        embedUrl: challenge.embedUrl,
        geography: challenge.geography,
        urlsToConsult: challenge.urlsToConsult,
        requireGafamWebsiteAccess: challenge.requireGafamWebsiteAccess,
        isIncompatibleIpadCertif: challenge.isIncompatibleIpadCertif,
        deafAndHardOfHearing: challenge.deafAndHardOfHearing,
        isAwarenessChallenge: challenge.isAwarenessChallenge,
        toRephrase: challenge.toRephrase,
        hasEmbedInternalValidation: challenge.hasEmbedInternalValidation,
        noValidationNeeded: challenge.noValidationNeeded,
        instruction: challenge.instruction,
        alternativeInstruction: challenge.alternativeInstruction,
        proposals: challenge.proposals,
        solution: challenge.solution,
        solutionToDisplay: challenge.solutionToDisplay,
        embedTitle: challenge.embedTitle,
        illustrationAlt: challenge.illustrationAlt,
      })],
    });
  }
});

export function deserialize(payload) {
  return deserializer.deserialize(payload);
}
