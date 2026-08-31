import { DomainTransaction } from '../../domain/DomainTransaction.js';

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
  await knex
    .with(
      'external_urls',
      knex.select('url')
        .from('challenge_external_urls')
        .unionAll(function() {
          this.select('url')
            .from('tutorial_external_urls');
        }),
    )
    .delete()
    .from('broken_urls')
    .whereNotIn('url', knex.select('url').from('external_urls'));
}
