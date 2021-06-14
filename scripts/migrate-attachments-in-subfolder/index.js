const Airtable = require('airtable');
const axios = require('axios');
const getToken = require('../common/token');

module.exports = {
  main,
  shouldBeMigrated,
  cloneFile,
}

function eachRecord(callback) {
  const base = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY
  }).base(process.env.AIRTABLE_BASE);

  base('Attachments').select({
    view: "Grid view"
 }).eachPage(function page(records, fetchNextPage) {
    records.forEach(callback);

    fetchNextPage();
 }, function done(err) {
   if (err) { console.error(err); return; }
 });
}

function shouldBeMigrated(record) {
  return !record.get('url').endsWith('/' + record.get('filename'));
}

async function cloneFile(originalUrl, filename, clock = Date) {
  const token = await getToken();
  const parsedUrl = new URL(originalUrl);
  const newUrl = parsedUrl.protocol + '//'+ parsedUrl.hostname + '/' + clock.now() + '/' + filename;

  const config = {
    headers: {
      'X-Auth-Token': token,
      'X-Copy-From': process.env.BUCKET_NAME + parsedUrl.pathname,
    }
  };

  await axios.put(newUrl, {}, config);

  return newUrl;
}

function main() {
  eachRecord((record) => {
    if (shouldBeMigrated(record)) {
      console.log(record.get('Record ID'));
    }
  });
}

if (process.env.NODE_ENV !== 'test') {
  main();
}
