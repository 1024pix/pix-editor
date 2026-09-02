import { CrawledUrl } from '../../../domain/models/index.js';

export function deserialize(ohdearPayload) {
  return ohdearPayload.run.result_payload.crawled_urls.map((url) => {
    return new CrawledUrl({
      statusCode: url.status_code,
      url: url.crawled_url,
      errorMessage: url.error_message,
    });
  });
}
