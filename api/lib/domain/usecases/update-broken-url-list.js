import { saveNewlyBrokenUrlList, removeRepairedUrlList } from '../../infrastructure/repositories/broken-url-repository.js';

export async function updateBrokenUrlList(crawledUrlList) {
  const repairedUrlList = crawledUrlList.filter((url) => url.statusCode < 400);
  if (repairedUrlList.length > 0) {
    await removeRepairedUrlList(repairedUrlList);
  }

  const brokenUrlList = crawledUrlList.filter((url) => url.statusCode >= 400);
  if (brokenUrlList.length > 0) {
    await saveNewlyBrokenUrlList(brokenUrlList);
  }
}
