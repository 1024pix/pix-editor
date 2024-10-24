import { WhitelistedUrl } from '../../../../lib/domain/readmodels/WhitelistedUrl.js';

export function buildWhitelistedUrl({
  id = 1,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2021-01-01'),
  creatorName = 'Ma maman',
  latestUpdatorName = 'Ma maman',
  url = 'http://pipeau-la-grenouille.fr',
  relatedEntityIds = 'recINswt85utqO5KJ,recPiCGFhfgervqr5',
  comment = 'Les grenouilles sont jolies',
} = {}) {
  return new WhitelistedUrl({
    id,
    createdAt,
    updatedAt,
    creatorName,
    latestUpdatorName,
    url,
    relatedEntityIds,
    comment,
  });
}
