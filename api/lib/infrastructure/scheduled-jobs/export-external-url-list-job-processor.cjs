module.exports = async function exportExternalListJobProcessor(job) {
  const { default: processor } = await import('./export-external-url-list-job-processor.js');
  return processor(job);
};
