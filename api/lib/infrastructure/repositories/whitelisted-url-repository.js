import { knex } from '../../../db/knex-database-connection.js';
import { WhitelistedUrl as ReadWhitelistedUrl } from '../../domain/readmodels/WhitelistedUrl.js';

export async function listRead() {
  const whitelistedUrlDtos = await knex('whitelisted_urls')
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
    .whereNull('deletedAt')
    .orderBy('url');

  return toDomainReadList(whitelistedUrlDtos);
}

function toDomainReadList(whitelistedUrlDtos) {
  return whitelistedUrlDtos.map(toDomainRead);
}

function toDomainRead(whitelistedUrlDto) {
  return new ReadWhitelistedUrl(whitelistedUrlDto);
}
