import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { WhitelistedUrl } from '../../domain/readmodels/WhitelistedUrl.js';

function buildBaseReadQuery(knexConn) {
  return knexConn('whitelisted_urls')
    .select({
      id: 'whitelisted_urls.id',
      createdAt: 'whitelisted_urls.createdAt',
      updatedAt: 'whitelisted_urls.updatedAt',
      url: 'whitelisted_urls.url',
      relatedSkillNames: 'whitelisted_urls.relatedSkillNames',
      comment: 'whitelisted_urls.comment',
      checkType: 'whitelisted_urls.checkType',
      creatorName: 'users_for_creation.name',
      latestUpdatorName: 'users_for_update.name',
    })
    .leftJoin('users as users_for_creation', 'users_for_creation.id', 'whitelisted_urls.createdBy')
    .leftJoin('users as users_for_update', 'users_for_update.id', 'whitelisted_urls.latestUpdatedBy')
    .whereNull('deletedAt');
}

export async function list() {
  const knexConn = DomainTransaction.getConnection();
  const whitelistedUrlDtos = await buildBaseReadQuery(knexConn).orderBy('url');

  return toDomainList(whitelistedUrlDtos);
}

export async function find(id) {
  const knexConn = DomainTransaction.getConnection();
  const whitelistedUrlDto = await buildBaseReadQuery(knexConn).where('whitelisted_urls.id', id).first();

  if (!whitelistedUrlDto) return null;
  return toDomain(whitelistedUrlDto);
}

/**
 * @param {object[]} whitelistedUrlDtos
 */
function toDomainList(whitelistedUrlDtos) {
  return whitelistedUrlDtos.map(toDomain);
}

function toDomain(whitelistedUrlDto) {
  return new WhitelistedUrl(whitelistedUrlDto);
}
