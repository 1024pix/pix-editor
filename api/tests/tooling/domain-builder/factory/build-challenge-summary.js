import { ChallengeSummary } from '../../../../lib/domain/readmodels/index.js';

export function buildChallengeSummary({
  id = 'challengeSum132',
  instruction = 'My instruction',
  skillName = 'skillA',
  status = 'A',
  index = '1',
  previewUrl = 'url.com',
} = {}) {
  return new ChallengeSummary({
    id,
    instruction,
    skillName,
    status,
    index,
    previewUrl,
  });
}
