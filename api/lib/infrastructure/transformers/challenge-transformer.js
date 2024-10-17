import _ from 'lodash';
import { Attachment, Skill } from '../../domain/models/index.js';

export function createChallengeTransformer({ attachments }) {
  return _.flow(
    _addAttachmentsToChallenge({ attachments }),
    _filterChallengeFields,
  );
}

export function fillAlternativeQualityFieldsFromMatchingProto(challenges, skills) {
  const workbenchSkillIds = skills
    .filter((skill) => skill.name === Skill.WORKBENCH_NAME)
    .map(({ id }) => id);

  const workbenchSkillIdsSet = new Set(workbenchSkillIds);

  const challengesNotFromWorkbench = challenges.filter((challenge) => !workbenchSkillIdsSet.has(challenge.skillId));

  const challengesBySkillIdAndVersion = _.groupBy(challengesNotFromWorkbench, (challenge) => {
    return `${challenge.skillId}__${challenge.version}`;
  });

  Object.values(challengesBySkillIdAndVersion).forEach((groupedChallenges) => {
    const prototype = groupedChallenges.find((challenge) => challenge.isPrototype);

    if (!prototype) return;

    for (const challenge of groupedChallenges) {
      _fillAlternativeQualityFields(challenge, prototype);
    }
  });
}

function _fillAlternativeQualityFields(challenge, prototype) {
  const fieldsToOverride = [
    'accessibility1',
    'accessibility2',
  ];

  for (const field of fieldsToOverride) {
    challenge[field] = prototype[field];
  }
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
    'requireGafamWebsiteAccess',
    'isIncompatibleIpadCertif',
    'deafAndHardOfHearing',
    'isAwarenessChallenge',
    'toRephrase',
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
