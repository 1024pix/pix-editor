import { DomainTransaction } from '../../domain/DomainTransaction.js';

export async function updateBrokenUrlTable(brokenUrlList) {
  const knex = DomainTransaction.getConnection();

  await knex('broken_urls').del();
  await knex('broken_urls').insert(brokenUrlList);
}
