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
  const brokenUrlList = await knexConn('broken_urls')
    .select(
      'broken_urls.*',
      knexConn.raw('json_agg("external_urls-localized_challenges"."localizedChallengeId") as "localizedChallengeIds"'),
      knexConn.raw('json_agg("skills-tutorials"."skillId") as "skillIds"'),
    )
    .innerJoin('external_urls', 'broken_urls.url', 'external_urls.url')
    .leftJoin('external_urls-localized_challenges', 'external_urls.id', 'external_urls-localized_challenges.externalUrlId')
    .leftJoin('external_urls-tutorials', 'external_urls.id', 'external_urls-tutorials.externalUrlId')
    .leftJoin('skills-tutorials', 'external_urls-tutorials.tutorialId', 'skills-tutorials.tutorialId')
    .groupBy('broken_urls.id', 'broken_urls.url', 'broken_urls.statusCode', 'broken_urls.errorMessage')
    .orderBy('url');

  return toDomainList(brokenUrlList);
}

function toDomainList(brokenUrlList) {
  return brokenUrlList.map((dto) => {
    const formattedData = {
      id: dto.id,
      errorMessage: dto.errorMessage,
      statusCode: dto.statusCode,
      url: dto.url,
      localizedChallengeIds: dto.localizedChallengeIds.filter(Boolean).toSorted(),
      skillIds: dto.skillIds.filter(Boolean).toSorted(),
    };

    return new BrokenUrl(formattedData);
  });
}
