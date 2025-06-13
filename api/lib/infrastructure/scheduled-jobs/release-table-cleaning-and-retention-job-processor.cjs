module.exports = async function releasesTableCleaningAndRetentionJobProcessor(job) {
  const { default: processor } = await import('./release-table-cleaning-and-retention-job.js');
  return processor(job);
};
