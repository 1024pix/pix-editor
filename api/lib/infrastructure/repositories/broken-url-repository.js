import { DomainTransaction } from '../../domain/DomainTransaction.js';

export async function removeRepairedUrlList(urlList) {
  if (!urlList.length) return;

  const knex = DomainTransaction.getConnection();
  await knex('broken_urls').whereIn('url', urlList).del();
}

export async function saveNewlyBrokenUrlList(urlList) {
  if (!urlList.length) return;

  const knex = DomainTransaction.getConnection();
  await knex('broken_urls').insert(urlList).onConflict('url').ignore();
}
