import _ from 'lodash';
import { createChallengeTranslator, translateChallenge } from '../../domain/services/translate-challenge.js';

export function createChallengeTransformer({ attachments, localizedChallenges, localizedChallenge }) {

  if (localizedChallenges) {
    return _.flow(
      _addAttachmentsToChallenge({ attachments }),
      createChallengeTranslator({ localizedChallenges }),
      _filterChallengesFields,
    );
  }

  if (localizedChallenge) {
    return _.flow(
      _addAttachmentsToChallenge({ attachments }),
      (challenge) => translateChallenge(challenge, localizedChallenge),
      _filterChallengeFields,
    );
  }

  return _.flow(
    _addAttachmentsToChallenge({ attachments }),
    _filterChallengeFields,
  );
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
    const challengeAttachments = challenge.files.map((fileId) => attachments.find(({ id }) => id === fileId));
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
