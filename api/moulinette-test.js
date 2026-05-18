import makeFetchCookie from 'fetch-cookie';

const fetchCookie = makeFetchCookie(fetch);

const response = await fetchCookie('https://www.education.gouv.fr/cadre-d-usage-de-l-ia-en-education-450647', {
  method: 'GET',
  timeout: 15_000,
  maxRedirects: 10,
  headers: { Accept: '*/*', 'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:64.0) Gecko/20100101 Firefox/80.0' },
});

console.log(response.status, typeof response.status, response.statusText, await response.text());
