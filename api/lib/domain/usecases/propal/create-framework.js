const createFramework = async function({ framework, frameworkRepository, frameworkTransformer, pixApiClient, updatedRecordNotifier, logger, Sentry }) {
  const createdFramework = await frameworkRepository.create(framework);

  try {
    await updatedRecordNotifier.notify({
      pixApiClient,
      model: 'frameworks',
      updatedRecord: frameworkTransformer.filterFrameworkFields(createdFramework),
    });
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
  }

  return createdFramework;
};

createFramework.NEED_TRX = true;
export { createFramework };
