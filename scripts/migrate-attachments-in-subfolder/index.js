import Airtable from 'airtable';
import axios from 'axios';
import getToken from '../common/token.js';
import ProgressBar from 'progress';
import pLimit from 'p-limit';
const limit = pLimit(10);

function getBaseAttachments() {
  const base = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY
  }).base(process.env.AIRTABLE_BASE);

  return base('Attachments');
}

function eachRecord(callback) {
  getBaseAttachments().select({
    view: 'Grid view'
  }).eachPage(async function page(records, fetchNextPage) {
    records.forEach(async (record) => {
      await limit(() => callback(record));
    });

    fetchNextPage();
  }, function done(err) {
    if (err) { console.error(err); return; }
  });
}

export function shouldBeMigrated(record) {
  return !record.get('url').endsWith('/' + encodeURIComponent(record.get('filename')));
}

export async function cloneFile(token, originalUrl, randomString, filename, clock = Date) {
  const parsedUrl = new URL(originalUrl);
  const newUrl = parsedUrl.protocol + '//' + parsedUrl.hostname + '/' + randomString + clock.now() + '/' + encodeURIComponent(filename);

  const config = {
    headers: {
      'X-Auth-Token': token,
      'X-Copy-From': process.env.BUCKET_NAME + parsedUrl.pathname,
    }
  };

  try {
    await axios.put(newUrl, null, config);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
  return newUrl;
}

export async function updateRecord(base, id, url) {
  return new Promise((resolve, reject) => {
    base.update([
      {
        id,
        fields: {
          url,
        },
      },
    ], (err) => {
      if (err) reject();
      else resolve();
    });
  });
}

export async function main() {
  const bar = new ProgressBar('[:bar] :percent', {
    total: 10000,
    width: 50,
  });
  const token = await getToken();

  eachRecord(async (record) => {
    if (shouldBeMigrated(record)) {
      const newUrl = await cloneFile(token, record.get('url'), record.id, record.get('filename'));
      await updateRecord(getBaseAttachments(), record.id, newUrl);
    }
    bar.tick();
  });
}

if (process.env.NODE_ENV !== 'test') {
  main();
}
