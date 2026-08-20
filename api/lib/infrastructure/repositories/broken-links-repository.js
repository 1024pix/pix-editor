import { urlBrokenLinksMonitor } from '../../config.js';
import { BrokenLink } from '../../domain/models/BrokenLink.js';

export async function fetchBrokenLinks() {
  const monitorIds = await fetchMonitorIds();
  const brokenLinks = [];
  for (const monitorId of monitorIds) {
    const brokenLinksByMonitorId = await fetchBrokenLinksByMonitorId(monitorId);
    brokenLinks.push(...brokenLinksByMonitorId);
  }

  return brokenLinks;
}

async function fetchMonitorIds() {
  const monitors = await fetch(`${urlBrokenLinksMonitor.ohdearBaseUrl}/api/monitors`, { headers: { authorization: `Bearer ${urlBrokenLinksMonitor.ohdearToken}` } })
    .then((res) => res.json());
  return monitors.data.map(({ id }) => id);
}

async function fetchBrokenLinksByMonitorId(monitorId) {
  const brokenLinks = await fetch(`${urlBrokenLinksMonitor.ohdearBaseUrl}/api/broken-links/${monitorId}`, { headers: { authorization: `Bearer ${urlBrokenLinksMonitor.ohdearToken}` } })
    .then((res) => res.json());
  return brokenLinks.data.map((data) => new BrokenLink({
    crawledUrl: data.crawled_url,
    errorMessage: data.error_message,
    statusCode: data.status_code,
  }));
}
