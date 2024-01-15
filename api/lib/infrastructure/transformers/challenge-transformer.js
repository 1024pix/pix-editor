import _ from 'lodash';
import { Challenge } from '../../domain/models/Challenge.js';
import { fields as challengeLocalizedFields } from '../../infrastructure/translations/challenge.js';

export function createChallengeTransformer({ attachments, localizedChallenges, localizedChallenge }) {

  if (localizedChallenges) {
    return _.flow(
      _addAttachmentsToChallenge({ attachments }),
      _challengeToTranslatedChallenges({ localizedChallenges }),
      _filterChallengesFields,
    );
  }

  if (localizedChallenge) {
    return _.flow(
      _addAttachmentsToChallenge({ attachments }),
      (challenge) => _translateChallenge(challenge, localizedChallenge),
      _filterChallengeFields,
    );
  }

  return _.flow(
    _addAttachmentsToChallenge({ attachments }),
    _filterChallengeFields,
  );
}

function _challengeToTranslatedChallenges({ localizedChallenges }) {
  return (challenge) => localizedChallenges
    .filter((localizedChallenge) => localizedChallenge.challengeId === challenge.id)
    .map((localizedChallenge) => _translateChallenge(challenge, localizedChallenge));
}

function _translateChallenge(challenge, localizedChallenge) {
  const primaryLocale = Challenge.getPrimaryLocale(challenge.locales) ?? 'fr';
  const isPrimaryLocale = primaryLocale === localizedChallenge.locale;
  const clearedLocalizedFields = challengeLocalizedFields.reduce((acc, field) => {
    acc[field] = '';
    return acc;
  }, {});
  return {
    ...challenge,
    ...clearedLocalizedFields,
    ...challenge.translations[localizedChallenge.locale],
    id: localizedChallenge.id,
    status: isPrimaryLocale ? challenge.status : getLocalizedChallengeStatus(challenge, localizedChallenge),
    embedUrl: localizedChallenge.embedUrl ?? _replaceLangParamsInUrl(localizedChallenge.locale, challenge.embedUrl),
    locales: isPrimaryLocale ? challenge.locales : [localizedChallenge.locale],
  };
}

function getLocalizedChallengeStatus(challenge, localizedChallenge) {
  if (['proposé', 'périmé'].includes(challenge.status) || localizedChallenge.status === 'validé') {
    return challenge.status;
  }
  return localizedChallenge.status;
}

function _replaceLangParamsInUrl(locale, embedUrl) {
  if (!embedUrl) return undefined;
  const url = new URL(embedUrl);
  url.searchParams.set('lang', locale);
  return url.href;
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
