import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { BrokenUrl } from '../../domain/readmodels/BrokenUrl.js';

export async function list() {
  const knexConn = DomainTransaction.getConnection();
  const brokenUrlList = await knexConn('broken_urls')
    .select({
      id: 'broken_urls.id',
      statusCode: 'broken_urls.statusCode',
      errorMessage: 'broken_urls.errorMessage',
      url: 'broken_urls.url',
    })
    .orderBy('url');

  return toDomainList(brokenUrlList);
}

function toDomainList(brokenUrlDtos) {
  return brokenUrlDtos.map(toDomain);
}

function toDomain(brokenUrlDto) {
  return new BrokenUrl(brokenUrlDto);
}
