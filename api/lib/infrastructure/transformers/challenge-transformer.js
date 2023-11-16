import _ from 'lodash';
import { Challenge } from '../../domain/models/Challenge.js';

export function createChallengeTransformer({ attachments, withLocalizedChallenges = false }) {
  if (withLocalizedChallenges) {
    return _.flow(
      _addAttachmentsToChallenge({ attachments }),
      _localizeChallenge,
      _filterChallengesFields,
    );
  }

  return _.flow(
    _addAttachmentsToChallenge({ attachments }),
    _filterChallengeFields,
  );
}

function _localizeChallenge(challenge) {
  const primaryLocale = Challenge.getPrimaryLocale(challenge.locales) ?? 'fr';
  return Object.keys(challenge.translations ?? {}).map((locale) => {
    const isPrimaryLocale = primaryLocale === locale;
    const localizedChallenge = {
      ...challenge,
      ...challenge.translations[locale],
      id: isPrimaryLocale ? challenge.id : `${challenge.id}-${locale}`,
      locales: isPrimaryLocale ? challenge.locales : [locale],
    };
    delete localizedChallenge.translations;
    return localizedChallenge;
  });
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
    'translations',
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
