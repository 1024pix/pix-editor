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
    'notes',
    'challengeLocales',
    'changelogEntries',
    'isQualityOk',
  ],
  typeForAttribute(attribute) {
    if (attribute === 'localizedChallenges') return 'localized-challenges';
    if (attribute === 'localizedChallenge') return 'localized-challenges';
    if (attribute === 'challengeLocales') return 'challenge-locales';
  },
  skill: {
    ref(challenge, skillId) {
      return skillId;
    },
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
  notes: {
    ref: 'id',
    ignoreRelationshipData: true,
    relationshipLinks: {
      related: function(record, current, parent) {
        return `/api/notes?filter[challengeId]=${parent.id}`;
      },
    },
  },
  changelogEntries: {
    ref: 'id',
    ignoreRelationshipData: true,
    relationshipLinks: {
      related: function(record, current, parent) {
        return `/api/changelog-entries?filter[elementId]=${parent.id}`;
      },
    },
  },
  challengeLocales: {
    ref: 'id',
    included: true,
    attributes: ['locale', 'localizedChallenge'],
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
      const localizedChallenge = challenge.localizedChallenges.find(
        (localizedChallenge) => localizedChallenge.locale === locale,
      );
      return {
        id: `${challenge.id}-${locale}`,
        locale,
        localizedChallenge: { id: localizedChallenge?.id },
      };
    });
    challenge.notes = [];
    challenge.changelogEntries = [];
    return challenge;
  },
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
    challenge.files = challenge.attachments?.map((fileId) => ({
      fileId,
      localizedChallengeId: challenge.id,
    }));
    return challenge;
  },
});

export function deserialize(challengeBody) {
  return new Promise((resolve, reject) => {
    deserializer.deserialize(challengeBody, (err, challengeObject) => {
      challengeObject.localizedChallenges = [
        LocalizedChallenge.buildPrimary({
          challengeId: challengeObject.id,
          locale: Challenge.getPrimaryLocale(challengeObject.locales),
          embedUrl: challengeObject.embedUrl,
          geography: challengeObject.geography,
          urlsToConsult: challengeObject.urlsToConsult,
          requireGafamWebsiteAccess: challengeObject.requireGafamWebsiteAccess,
          isIncompatibleIpadCertif: challengeObject.isIncompatibleIpadCertif,
          deafAndHardOfHearing: challengeObject.deafAndHardOfHearing,
          isAwarenessChallenge: challengeObject.isAwarenessChallenge,
          toRephrase: challengeObject.toRephrase,
          hasEmbedInternalValidation: challengeObject.hasEmbedInternalValidation,
          noValidationNeeded: challengeObject.noValidationNeeded,
        }),
      ];
      return err ? reject(err) : resolve(new Challenge(challengeObject));
    });
  });
}
