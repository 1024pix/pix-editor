const _ = require('lodash');

module.exports = {
  createChallengeTransformer
};

function createChallengeTransformer(learningContent) {
  function _transformChallengeForRelease(challenge) {
    const transformers = [_addAttachmentsToChallenge, _filterChallengeFields];

    return transformers.reduce((accumulator, transformer) => {
      return transformer(learningContent, accumulator);
    }, challenge);
  }

  return _transformChallengeForRelease;
}

function _filterChallengeFields(_learningContent, challenge) {
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
    'skillIds',
    't1Status',
    't2Status',
    't3Status',
    'timer',
    'type',
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

function _addAttachmentsToChallenge(learningContent, challenge) {
  const newChallenge = { ...challenge };
  const attachments = learningContent.attachments.filter((attachment) => attachment.challengeId === newChallenge.id);
  attachments.forEach((attachment) => _assignAttachmentToChallenge(newChallenge, attachment));

  return newChallenge;
}
