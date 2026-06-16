import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { WhitelistedUrl } from '../../domain/models/index.js';

function buildBaseReadQuery(knexConn) {
  return knexConn('whitelisted_urls').select([
    'id',
    'createdBy',
    'latestUpdatedBy',
    'deletedBy',
    'createdAt',
    'updatedAt',
    'deletedAt',
    'url',
    'relatedSkillNames',
    'comment',
    'checkType',
  ]);
}

export async function list() {
  const knexConn = DomainTransaction.getConnection();
  const whitelistedUrlDtos = await buildBaseReadQuery(knexConn).orderBy('url');

  return toDomainList(whitelistedUrlDtos);
}

export async function find(id) {
  const knexConn = DomainTransaction.getConnection();
  const whitelistedUrlDto = await buildBaseReadQuery(knexConn).where({ id }).first();

  if (!whitelistedUrlDto) return null;
  return toDomain(whitelistedUrlDto);
}

export async function save(whitelistedUrl) {
  const knexConn = DomainTransaction.getConnection();
  const dataToSave = adaptModelToDB(whitelistedUrl);
  let id;
  if (whitelistedUrl.id) {
    id = whitelistedUrl.id;
    await knexConn('whitelisted_urls').update(dataToSave).where({ id });
  } else {
    const dataInserted = await knexConn('whitelisted_urls').insert(dataToSave, ['id']);
    id = dataInserted[0].id;
  }
  return id;
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
