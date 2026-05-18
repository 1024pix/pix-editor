import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import axios from 'axios';

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

const response = await client.head('https://www.education.gouv.fr/cadre-d-usage-de-l-ia-en-education-450647', {
  timeout: 15_000,
  maxRedirects: 10,
  headers: { Accept: '*/*', 'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:64.0) Gecko/20100101 Firefox/80.0' },
});

console.log(response.status, typeof response.status, response.statusText, await response.text());
