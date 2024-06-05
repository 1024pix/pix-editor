import _ from 'lodash';
import { extractUserIdFromRequest } from '../../infrastructure/monitoring-tools.js';
import {
  attachmentRepository,
  challengeRepository,
  skillRepository,
  tubeRepository,
  userRepository,
} from '../../infrastructure/repositories/index.js';
import { generateNewId } from '../../infrastructure/utils/id-generator.js';
import { cloneSkill } from '../../domain/usecases/index.js';

export async function clone(request, h) {
  const userId = extractUserIdFromRequest(request);
  try {
    const cloneCommand = normalizeCloneCommand(request.payload.data.attributes, userId);
    return await cloneSkill({
      cloneCommand,
      dependencies: {
        userRepository,
        skillRepository,
        challengeRepository,
        tubeRepository,
        attachmentRepository,
        generateNewIdFnc: generateNewId,
      },
    });
  } catch (err) {
    console.log(err);
    return h.response(err).code(400);
  }
}

function normalizeCloneCommand(attrs, userId) {
  const cloneCommand = {};
  if (!_.isString(attrs.tubeDestinationId)) {
    throw new Error('tubeDestinationId PAS BON');
  } else {
    cloneCommand.tubeDestinationId = attrs.tubeDestinationId;
  }
  if (!_.isString(attrs.skillIdToClone)) {
    throw new Error('skillIdToClone PAS BON');
  } else {
    cloneCommand.skillIdToClone = attrs.skillIdToClone;
  }
  if (!_.isNumber(parseInt(attrs.level))) {
    throw new Error('level PAS BON');
  } else {
    cloneCommand.level = parseInt(attrs.level);
  }
  if (!_.isString(attrs.changelogText)) {
    cloneCommand.changelogText = '';
  } else {
    cloneCommand.changelogText = attrs.changelogText;
  }
  cloneCommand.userId = userId;
  return cloneCommand;
}
