module.exports = async function uploadTranslationJobProcessor() {
  const { default: processor } = await import('./upload-translation-job-processor.js');
  return processor();
};
