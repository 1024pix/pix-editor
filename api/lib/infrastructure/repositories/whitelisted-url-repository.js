import { knex } from '../../../db/knex-database-connection.js';
import { WhitelistedUrl } from '../../domain/models/index.js';

export async function find(id) {
  const whitelistedUrlDto = await knex('whitelisted_urls')
    .select(['id', 'createdBy', 'latestUpdatedBy', 'deletedBy', 'createdAt', 'updatedAt', 'deletedAt', 'url', 'relatedSkillNames', 'comment', 'checkType'])
    .where({ id })
    .first();

  if (!whitelistedUrlDto) return null;
  return toDomain(whitelistedUrlDto);
}

export async function save(whitelistedUrl) {
  const dataToSave = adaptModelToDB(whitelistedUrl);
  const id = whitelistedUrl.id;
  await knex('whitelisted_urls').update(dataToSave).where({ id });
  return id;
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
    relatedSkillNames: whitelistedUrl.relatedSkillNames,
    comment: whitelistedUrl.comment,
    checkType: whitelistedUrl.checkType,
  };
}
