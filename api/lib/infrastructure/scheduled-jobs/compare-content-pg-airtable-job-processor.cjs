module.exports = async function compareContentPgAirtableJobProcessor() {
  const { default: processor } = await import('./compare-content-pg-airtable-job-processor.js');
  return processor();
};
