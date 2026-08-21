import { brokenUrlRepository } from '../../infrastructure/repositories/index.js';
import { DomainTransaction } from '../DomainTransaction.js';

export async function refreshBrokenUrls(crawledUrlList) {
  const repairedUrlList = crawledUrlList.filter((url) => url.status_code < 300).map((result) => result.crawled_url);
  const brokenUrlList = crawledUrlList.filter((url) => url.status_code >= 400).map((result) => ({
    url: result.crawled_url,
    errorMessage: result.error_message,
    statusCode: result.status_code,
  }));

  await DomainTransaction.execute(async () => {
    await brokenUrlRepository.removeRepairedUrlList(repairedUrlList);
    await brokenUrlRepository.saveNewlyBrokenUrlList(brokenUrlList);
  });
}
