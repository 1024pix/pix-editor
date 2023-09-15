module.exports = async function checkUrlsJobProcessor(job) {
  const { default: processor } = await import('./check-urls-job-processor.js');
  return processor(job);
};
