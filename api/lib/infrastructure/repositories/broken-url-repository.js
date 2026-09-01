import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { BrokenUrl } from '../../domain/readmodels/index.js';

/**
 * @typedef {import('../../domain/models/CrawledUrl.js').CrawledUrl} CrawledUrl
 */

/**
 * @param {CrawledUrl[]} brokenUrlList
 */
export async function saveNewlyBrokenUrlList(brokenUrlList) {
  const knex = DomainTransaction.getConnection();

  await knex('broken_urls').insert(brokenUrlList)
    .onConflict('url')
    .ignore();
}

/**
 * @param {CrawledUrl[]} repairedUrlList
 */
export async function removeRepairedUrlList(repairedUrlList) {
  const knex = DomainTransaction.getConnection();
  const repairedUrls = repairedUrlList.map(({ url }) => url);

  await knex('broken_urls').delete().whereIn('url', repairedUrls);
}

export async function deleteUnmentionedBrokenUrls() {
  const knex = DomainTransaction.getConnection();
  await knex.delete()
    .from('broken_urls')
    .whereNotIn('url', knex.select('url').from('external_urls'));
}

export async function list() {
  const knexConn = DomainTransaction.getConnection();
  const brokenUrlList = await knexConn('broken_urls').select('*').orderBy('url');

  return toDomainList(brokenUrlList);
}

function toDomainList(brokenUrlList) {
  return brokenUrlList.map((dto) => new BrokenUrl(dto));
}
