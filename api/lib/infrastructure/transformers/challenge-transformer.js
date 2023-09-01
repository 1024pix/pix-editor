import _ from 'lodash';

export function createChallengeTransformer({ attachments }) {
  return (challenge) => _filterChallengeFields(_addAttachmentsToChallenge({ attachments }, challenge));
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
    'alternativeVersion'
  ];

  return _.pick(challenge, fieldsToInclude);
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

function _addAttachmentsToChallenge({ attachments }, challenge) {
  const newChallenge = { ...challenge, illustrationAlt: null, illustrationUrl: null };
  const challengeAttachments = attachments.filter((attachment) => attachment.challengeId === newChallenge.id);
  challengeAttachments.forEach((attachment) => _assignAttachmentToChallenge(newChallenge, attachment));

  return newChallenge;
}
