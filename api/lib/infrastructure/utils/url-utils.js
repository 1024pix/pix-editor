import showdown from 'showdown';
import urlRegex from 'url-regex-safe';
import _ from 'lodash';
import { logger } from '../logger.js';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import axios from 'axios';

export function findUrlsInMarkdown(value) {
  const safeValue = value || '';
  const converter = new showdown.Converter();
  const html = converter.makeHtml(safeValue);
  const urls = html.match(urlRegex({ strict: true }));
  if (!urls) {
    return [];
  }
  return _.uniq(urls.map(cleanUrl).map(ensureProtocol));
}

/**
 * @param {{ id: string, url: string }[]} identifiedUrls
 * @returns {{
 *   id: string,
 *   url: string,
 *   status: string,
 *   error: string,
 *   comments: string,
 * }[]}
 */
export async function analyzeIdentifiedUrls(identifiedUrls) {
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:64.0) Gecko/20100101 Firefox/80.0',
      'Accept': '*/*'
    },
    timeout: 15000,
    maxRedirects: 10,
    bulk: 50,
  };
  const pMap = (await import('p-map')).default;
  const analyzeResults = await pMap(identifiedUrls, async (identifiedUrl) => {
    const config = { timeout: options.timeout, maxRedirects: options.maxRedirects, headers: options.headers };
    try {
      new URL(identifiedUrl.url);
    } catch (e) {
      return { id: identifiedUrl.id, url: identifiedUrl.url, status: 'KO', error: 'FORMAT_ERROR', comments: e.message };
    }
    try {
      logger.trace(`checking ${identifiedUrl.url}`);
      const response = await checkUrl(identifiedUrl.url, config);
      if (response.status === 200) {
        return { id: identifiedUrl.id, url: identifiedUrl.url, status: 'OK', error: '', comments: '' };
      } else {
        return {
          id: identifiedUrl.id,
          url: identifiedUrl.url,
          status: 'KO',
          error: 'HTTP_ERROR',
          comments: 'HTTP status is not 200'
        };
      }
    } catch (e) {
      return { id: identifiedUrl.id, url: identifiedUrl.url, status: 'KO', error: 'HTTP_ERROR', comments: e.message };
    } finally {
      logger.trace(`done checking ${identifiedUrl.url}`);
    }
  }, { concurrency: options.bulk });
  return analyzeResults;
}

export async function checkUrl(url, config) {
  const jar = new CookieJar();
  const client = wrapper(axios.create({ jar }));
  try {
    return (await client.head(url, config));
  } catch {
    return (await client.get(url, config));
  }
}

function cleanUrl(url) {
  const index = url.indexOf('</');
  if (index >= 0) {
    return url.substr(0, index);
  }
  return url;
}

function ensureProtocol(url) {
  if (/^https?:\/\//.test(url)) return url;
  return  url = 'https://' + url;
}

export function getOrigin(url) {
  return new URL(url).origin;
}
