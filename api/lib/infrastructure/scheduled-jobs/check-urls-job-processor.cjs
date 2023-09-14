module.exports = async function checkUrlsJobProcessor() {
  const { default: processor } = await import('./check-urls-job-processor.js');
  return processor();
};
