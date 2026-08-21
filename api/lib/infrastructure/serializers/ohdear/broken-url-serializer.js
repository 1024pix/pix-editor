import { BrokenUrl } from '../../../domain/models/index.js';

export function deserialize(brokenUrls) {
  return brokenUrls.map((brokenUrl) => {
    return new BrokenUrl({
      statusCode: brokenUrl.status_code,
      url: brokenUrl.crawled_url,
      errorMessage: brokenUrl.error_message,
    });
  });
}
