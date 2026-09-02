import * as brokenUrlRepository from '../../infrastructure/repositories/broken-url-repository.js';

/**
 * @typedef {import('../models/CrawledUrl.js').CrawledUrl} CrawledUrl
 */

/**
 * @param {CrawledUrl[]} crawledUrlList
 */
export async function updateBrokenUrlList(crawledUrlList) {
  const repairedUrlList = crawledUrlList.filter((url) => url.isRepaired);
  if (repairedUrlList.length > 0) {
    await brokenUrlRepository.removeRepairedUrlList(repairedUrlList);
  }

  const brokenUrlList = crawledUrlList.filter((url) => url.isBroken);
  if (brokenUrlList.length > 0) {
    await brokenUrlRepository.saveNewlyBrokenUrlList(brokenUrlList);
  }
}
