import { logger } from '../logger.js';

export async function notify({ pixApiClient, updatedRecord, model }) {
  if (pixApiClient.isPixApiCachePatchingEnabled()) {
    return pixApiClient.request({ payload: updatedRecord, url: `/api/cache/${model}/${updatedRecord.id}` });
  }
  logger.info(`Refreshing cache with ${JSON.stringify(updatedRecord)} for model ${model}`);
}
