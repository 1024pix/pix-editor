import { DomainTransaction } from '../../domain/DomainTransaction.js';

export async function saveNewlyBrokenUrlList(brokenUrlList) {
  const knex = DomainTransaction.getConnection();

  try {
    await knex('broken_urls').insert(brokenUrlList)
      .onConflict('url')
      .ignore();
  } catch (error) {
    console.log(error);
  }
}

export async function removeRepairedUrlList(repairedUrlList) {
  const knex = DomainTransaction.getConnection();
  const repairedUrls = repairedUrlList.map((url) => url.url);

  try {
    await knex('broken_urls').del().whereIn('url', repairedUrls);
  } catch (error) {
    console.log(error);
  }
}

