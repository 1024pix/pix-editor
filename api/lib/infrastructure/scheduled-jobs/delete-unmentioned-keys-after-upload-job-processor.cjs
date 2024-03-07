module.exports = async function deleteUnmentionedKeysAfterUploadJobProcessor(job) {
  const { default: processor } = await import('./delete-unmentioned-keys-after-upload-job-processor.js');
  return processor(job);
};
