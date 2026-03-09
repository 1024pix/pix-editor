module.exports = async function releasesTableCleaningAndRetentionJobProcessor(job) {
  const { default: processor } = await import('./release-table-cleaning-and-retention-job-processor.js');
  return processor(job);
};
