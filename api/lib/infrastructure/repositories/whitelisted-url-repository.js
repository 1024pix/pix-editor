import { knex } from '../../../db/knex-database-connection.js';
import { WhitelistedUrl as ReadWhitelistedUrl } from '../../domain/readmodels/WhitelistedUrl.js';
import { WhitelistedUrl } from '../../domain/models/index.js';

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

  return toDomainReadList(whitelistedUrlDtos);
}

export async function find(id) {
  const whitelistedUrlDto = await knex('whitelisted_urls')
    .select(['id', 'createdBy', 'latestUpdatedBy', 'deletedBy', 'createdAt', 'updatedAt', 'deletedAt', 'url', 'relatedEntityIds', 'comment'])
    .where({ id })
    .first();

  if (!whitelistedUrlDto) return null;
  return toDomain(whitelistedUrlDto);
}

export async function save(whitelistedUrl) {
  const dataToSave = adaptModelToDB(whitelistedUrl);
  await knex('whitelisted_urls').update(dataToSave).where({ id: whitelistedUrl.id });
}

function toDomainReadList(whitelistedUrlDtos) {
  return whitelistedUrlDtos.map(toDomainRead);
}

function toDomainRead(whitelistedUrlDto) {
  return new ReadWhitelistedUrl(whitelistedUrlDto);
}

function toDomain(whitelistedUrlDto) {
  return new WhitelistedUrl(whitelistedUrlDto);
}

function adaptModelToDB(whitelistedUrl) {
  return {
    createdBy: whitelistedUrl.createdBy,
    latestUpdatedBy: whitelistedUrl.latestUpdatedBy,
    deletedBy: whitelistedUrl.deletedBy,
    createdAt: whitelistedUrl.createdAt,
    updatedAt: whitelistedUrl.updatedAt,
    deletedAt: whitelistedUrl.deletedAt,
    url: whitelistedUrl.url,
    relatedEntityIds: whitelistedUrl.relatedEntityIds,
    comment: whitelistedUrl.comment,
  };
}
