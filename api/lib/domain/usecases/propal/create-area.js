const createArea = async function({ area, areaRepository, areaTransformer, pixApiClient, updatedRecordNotifier, logger, Sentry }) {
  const areas = await areaRepository.listByFrameworkId(area.frameworkId);

  area.code = `${(areas?.length ?? 0) + 1}`;

  const createdArea = await areaRepository.create(area);

  try {
    await updatedRecordNotifier.notify({
      pixApiClient,
      model: 'areas',
      updatedRecord: areaTransformer.filterAreaFields(createdArea),
    });
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
  }

  return createdArea;
};

createArea.NEED_TRX = true;

export { createArea };
