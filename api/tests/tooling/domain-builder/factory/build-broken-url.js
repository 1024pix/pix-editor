import { BrokenUrl } from '../../../../lib/domain/readmodels/index.js';

export function buildBrokenUrl({
  id = 1,
  errorMessage = 'Not Found',
  statusCode = 404,
  url = 'http://localhost:8080/',
  frameworks = ['Pix'],
  localizedChallengeIds = ['recChallenge1'],
  skillIds = [],
  tutorialIds = [],
} = {}) {
  return new BrokenUrl({
    id,
    errorMessage,
    statusCode,
    url,
    frameworks,
    localizedChallengeIds,
    skillIds,
    tutorialIds,
  });
}
