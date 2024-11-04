import { WhitelistedUrl as ReadWhitelistedUrl } from '../../../../lib/domain/readmodels/WhitelistedUrl.js';
import { WhitelistedUrl } from '../../../../lib/domain/models/index.js';

export function buildReadWhitelistedUrl({
  id = 1,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2021-01-01'),
  creatorName = 'Ma maman',
  latestUpdatorName = 'Ma maman',
  url = 'http://pipeau-la-grenouille.fr',
  relatedSkillNames = '@bidule4,@chose6',
  comment = 'Les grenouilles sont jolies',
  checkType = WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
} = {}) {
  return new ReadWhitelistedUrl({
    id,
    createdAt,
    updatedAt,
    creatorName,
    latestUpdatorName,
    url,
    relatedSkillNames,
    comment,
    checkType,
  });
}
