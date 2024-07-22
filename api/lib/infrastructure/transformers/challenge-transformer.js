import _ from 'lodash';
import { Attachment } from '../../domain/models/index.js';

export function createChallengeTransformer({ attachments }) {
  return _.flow(
    _addAttachmentsToChallenge({ attachments }),
    _filterChallengeFields,
  );
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
    'accessibility1',
    'accessibility2',
  ];

  return _.pick(challenge, fieldsToInclude);
}

function _addAttachmentsToChallenge({ attachments }) {
  return (challenge) => {
    const newChallenge = { ...challenge, illustrationUrl: null };
    const challengeAttachments = attachments.filter(({ localizedChallengeId }) => localizedChallengeId === challenge.id);
    challengeAttachments.forEach((attachment) => _assignAttachmentToChallenge(newChallenge, attachment));
    return newChallenge;
  };
}

function _assignAttachmentToChallenge(challenge, attachment) {
  if (attachment.type === Attachment.TYPES.ILLUSTRATION) {
    challenge.illustrationUrl = attachment.url;
  } else {
    if (!challenge.attachments) {
      challenge.attachments = [];
    }
    challenge.attachments.push(attachment.url);
  }
}
