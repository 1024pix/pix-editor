import showdown from 'showdown';
import urlRegex from 'url-regex-safe';
import _ from 'lodash';
import { logger } from '../logger.js';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import axios from 'axios';

const GENERIC_URL_REGEX_IN_TEXT = new RegExp(urlRegex({ strict: true, parens: true, returnString: true }), 'i');

export function findUrlsInMarkdown(value) {
  let safeValue = value ?? '';
  safeValue = safeValue.replace(/\u00a0/g, ' ');
  const converter = new showdown.Converter();
  const html = converter.makeHtml(safeValue);
  return findUrlsInText(html);
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
  if (/^https?:\/\//i.test(url)) return url;
  return 'https://' + url;
}

export function getOrigin(url) {
  return new URL(url).origin;
}

/* Given the following text: Coucou (https://fr.wikipedia.org/wiki/(14234)_Davidhoover)
  - With "parens" at false, it extracts the url until the first closing parenthesis : https://fr.wikipedia.org/wiki/(14234
  - With "parens" at true, it extracts the url until the last closing parenthesis, that does not belong to the url: https://fr.wikipedia.org/wiki/(14234)_Davidhoover)

  So we leave the mode that extracts the closest to what we want (which is "parens" at true) and we do some calculation to remove
  the last parenthesis if it does not belong to the url.
  If the character before the url is an opened parenthesis, then find the last closing parenthesis of the extracted URL
  and remove everything after this parenthesis (parenthesis included)
 */
export function findUrlsInText(inputText) {
  let textToParse = inputText;
  let hasUrlsLeft = true;
  const urls = [];
  do {
    const result = textToParse.match(GENERIC_URL_REGEX_IN_TEXT);
    if (!result) {
      hasUrlsLeft = false;
    } else {
      let url = result[0];
      const characterBeforeUrl = textToParse.charAt(result.index - 1);
      if (characterBeforeUrl === '(') {
        const indexOfLastParenthesis = url.lastIndexOf(')');
        if (indexOfLastParenthesis) {
          url = url.slice(0, indexOfLastParenthesis);
        }
      }
      urls.push(url);
      textToParse = textToParse.slice(result.index + url.length);
    }
  } while (hasUrlsLeft);
  if (!urls) {
    return [];
  }
  return _.uniq(urls.map(cleanUrl).map(ensureProtocol));
}
