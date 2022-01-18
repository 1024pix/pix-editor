const { checkUrl } = require('../lib/domain/usecases/validate-urls-from-release');

async function main(url) {
  console.log('checking', url);
  try {
    const result = await checkUrl(url, {
      timeout: 4000,
      maxRedirects: 10,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:64.0) Gecko/20100101 Firefox/80.0',
        'Accept': '*/*',
      },
    });
    console.log(result.status);
  } catch (e) {
    console.log(e.response?.headers);
    console.log(e.message);
  }
}

main(process.argv[2]);
