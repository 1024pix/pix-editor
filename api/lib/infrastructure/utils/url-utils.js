import showdown from 'showdown';
import urlRegex from 'url-regex-safe';
import _ from 'lodash';

export class UrlUtils {
  static findUrlsInMarkdown(value) {
    const safeValue = value || '';
    const converter = new showdown.Converter();
    const html = converter.makeHtml(safeValue);
    const urls = html.match(urlRegex({ strict: true }));
    if (!urls) {
      return [];
    }
    return _.uniq(urls.map(cleanUrl).map(prependProtocol));
  }
}

function cleanUrl(url) {
  const index = url.indexOf('</');
  if (index >= 0) {
    return url.substr(0, index);
  }
  return url;
}

function prependProtocol(url) {
  if (!url.includes('http')) {
    url = 'https://' + url;
  }
  return url;
}
