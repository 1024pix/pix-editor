module.exports = async function releaseJobProcessor(job) {
  const { default: processor } = await import('./release-job-processor.js');
  return processor(job);
};
