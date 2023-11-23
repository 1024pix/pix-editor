import _ from 'lodash';
import { Challenge } from '../../domain/models/Challenge.js';
import { fields as challengeLocalizedFields } from '../../infrastructure/translations/challenge.js';

export function createChallengeTransformer({ attachments, localizedChallenges }) {

  if (localizedChallenges) {
    return _.flow(
      _addAttachmentsToChallenge({ attachments }),
      _localizeChallenge({ localizedChallenges }),
      _filterChallengesFields,
    );
  }

  return _.flow(
    _addAttachmentsToChallenge({ attachments }),
    _filterChallengeFields,
  );
}

function _localizeChallenge({ localizedChallenges }) {
  return (challenge) => {
    const primaryLocale = Challenge.getPrimaryLocale(challenge.locales) ?? 'fr';
    return localizedChallenges
      .filter((localizedChallenge) => localizedChallenge.challengeId === challenge.id)
      .map(({ locale, id }) => {
        const isPrimaryLocale = primaryLocale === locale;
        const clearedLocalizedFields = challengeLocalizedFields.reduce((acc, field) => {
          acc[field] = '';
          return acc;
        }, {});
        return {
          ...challenge,
          ...clearedLocalizedFields,
          ...challenge.translations[locale],
          id,
          locales: isPrimaryLocale ? challenge.locales : [locale],
        };
      });
  };

}

function _filterChallengesFields(challenges) {
  return challenges.map(_filterChallengeFields);
}

function _filterChallengeFields(challenge) {
  const fieldsToInclude = [
    'id',
    'alpha',
    'alternativeInstruction',
    'attachments',
    'autoReply',
    'competenceId',
    'delta',
    'embedUrl',
    'embedTitle',
    'embedHeight',
    'focusable',
    'format',
    'genealogy',
    'illustrationAlt',
    'illustrationUrl',
    'instruction',
    'locales',
    'proposals',
    'responsive',
    'solution',
    'solutionToDisplay',
    'status',
    'skillId',
    't1Status',
    't2Status',
    't3Status',
    'timer',
    'type',
    'shuffled',
    'alternativeVersion',
  ];

  return _.pick(challenge, fieldsToInclude);
}

function _addAttachmentsToChallenge({ attachments }) {
  return (challenge) => {
    const newChallenge = { ...challenge, illustrationAlt: null, illustrationUrl: null };
    const challengeAttachments = attachments.filter((attachment) => attachment.challengeId === newChallenge.id);
    challengeAttachments.forEach((attachment) => _assignAttachmentToChallenge(newChallenge, attachment));
    return newChallenge;
  };
}

function _assignAttachmentToChallenge(challenge, attachment) {
  if (attachment.type === 'illustration') {
    challenge.illustrationAlt = attachment.alt;
    challenge.illustrationUrl = attachment.url;
  } else {
    if (!challenge.attachments) {
      challenge.attachments = [];
    }
    challenge.attachments.push(attachment.url);
  }
}
