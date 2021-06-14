const Airtable = require('airtable');

module.exports = {
  main,
  shouldBeMigrated,
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
