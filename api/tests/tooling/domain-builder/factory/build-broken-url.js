import { BrokenUrl as BrokenUrlRead } from '../../../../lib/domain/readmodels/index.js';
import { BrokenUrl } from '../../../../lib/domain/models/index.js';

export function buildBrokenUrlRead({
  id = 1,
  errorMessage = 'Not Found',
  statusCode = 404,
  url = 'http://localhost:8080/',
  frameworkNames = ['Pix'],
  localizedChallengeIds = ['recChallenge1'],
  skillIds = [],
  tutorialIds = [],
} = {}) {
  return new BrokenUrlRead({
    id,
    errorMessage,
    statusCode,
    url,
    frameworkNames,
    localizedChallengeIds,
    skillIds,
    tutorialIds,
  });
}

export function buildBrokenUrl({
  id = 1,
  errorMessage = 'Not Found',
  statusCode = 404,
  url = 'http://localhost:8080/',
  ignored = false,
} = {}) {
  return new BrokenUrl({
    id,
    errorMessage,
    statusCode,
    url,
    ignored,
  });
}
