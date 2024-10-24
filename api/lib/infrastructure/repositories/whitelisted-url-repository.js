import { knex } from '../../../db/knex-database-connection.js';
import { WhitelistedUrl } from '../../domain/readmodels/WhitelistedUrl.js';

export async function listRead() {
  const whitelistedUrlDtos = await knex('whitelisted_urls')
    .select({
      id: 'whitelisted_urls.id',
      createdAt: 'whitelisted_urls.createdAt',
      updatedAt: 'whitelisted_urls.updatedAt',
      url: 'whitelisted_urls.url',
      relatedEntityIds: 'whitelisted_urls.relatedEntityIds',
      comment: 'whitelisted_urls.comment',
      creatorName: 'users_for_creation.name',
      latestUpdatorName: 'users_for_update.name',
    })
    .leftJoin('users as users_for_creation', 'users_for_creation.id', 'whitelisted_urls.createdBy')
    .leftJoin('users as users_for_update', 'users_for_update.id', 'whitelisted_urls.latestUpdatedBy')
    .whereNull('deletedAt')
    .orderBy('url');

  return toDomainList(whitelistedUrlDtos);
}

function toDomainList(whitelistedUrlDtos) {
  return whitelistedUrlDtos.map(toDomain);
}

function toDomain(whitelistedUrlDto) {
  return new WhitelistedUrl(whitelistedUrlDto);
}
