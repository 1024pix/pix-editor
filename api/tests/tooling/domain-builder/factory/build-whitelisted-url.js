import { WhitelistedUrl as ReadWhitelistedUrl } from '../../../../lib/domain/readmodels/WhitelistedUrl.js';
import { WhitelistedUrl } from '../../../../lib/domain/models/index.js';

export function buildReadWhitelistedUrl({
  id = 1,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2021-01-01'),
  creatorName = 'Ma maman',
  latestUpdatorName = 'Ma maman',
  url = 'http://pipeau-la-grenouille.fr',
  relatedEntityIds = 'recINswt85utqO5KJ,recPiCGFhfgervqr5',
  comment = 'Les grenouilles sont jolies',
} = {}) {
  return new ReadWhitelistedUrl({
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

export function buildWhitelistedUrl({
  id = 1,
  createdBy = 123,
  latestUpdatedBy = 123,
  deletedBy = null,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2022-01-01'),
  deletedAt = null,
  url = 'http://pipeau-la-grenouille.fr',
  relatedEntityIds = 'recINswt85utqO5KJ,recPiCGFhfgervqr5',
  comment = 'Les grenouilles sont jolies',
} = {}) {
  return new WhitelistedUrl({
    id,
    createdBy,
    latestUpdatedBy,
    deletedBy,
    createdAt,
    updatedAt,
    deletedAt,
    url,
    relatedEntityIds,
    comment,
  });
}
