export async function mockUsecaseForTestingPurposes({ someArg1, areaRepository, translationRepository, someArg2, logger, someArg3 }) {
  return {
    res: someArg1 + someArg2 + someArg3,
    areaRepository,
    translationRepository,
    logger,
  };
}
