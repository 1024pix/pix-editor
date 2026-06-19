module.exports = async function saveExternalUrlsJobProcessor(job) {
  const { default: processor } = await import('./save-external-urls-job-processor.js');
  return processor(job);
};
