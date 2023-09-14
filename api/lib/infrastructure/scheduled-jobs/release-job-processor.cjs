module.exports = async function releaseJobProcessor() {
  const { default: processor } = await import('./release-job-processor.js');
  return processor();
};
