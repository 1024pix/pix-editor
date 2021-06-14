const Airtable = require('airtable');
const axios = require('axios');
const getToken = require('../common/token');
const ProgressBar = require('progress');

module.exports = {
  main,
  shouldBeMigrated,
  cloneFile,
  updateRecord,
}

function getBaseAttachments() {
  const base = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY
  }).base(process.env.AIRTABLE_BASE);

  return base('Attachments');
}

function eachRecord(callback) {
  getBaseAttachments().select({
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

  try {
    await axios.put(newUrl, {}, config);
  } catch (error) {
    console.log(`Clone file ${filename} from ${originalUrl} error: ${error}`)
  }
  return newUrl;
}

async function updateRecord(base, id, url) {
  return new Promise((resolve, reject) => {
    base.update([
      {
        id,
        fields: {
          url,
        },
      },
    ], (err, records) => {
      if (err) reject();
      else resolve();
    });
  });
}

function main() {
  const bar = new ProgressBar('[:bar] :percent', {
    total: 10000,
    width: 50,
  });

  eachRecord(async (record) => {
    if (shouldBeMigrated(record)) {
      const newUrl = await cloneFile(record.get('url'), record.get('filename'));
      await updateRecord(getBaseAttachments(), record.id, newUrl);
    }
    bar.tick();
  });
}

if (process.env.NODE_ENV !== 'test') {
  main();
}
