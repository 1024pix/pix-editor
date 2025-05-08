const mockUsecaseWithoutTrx = async function({ someArg1, mockRepositoryA, mockRepositoryB, someArg2, logger, someArg3, shouldThrow }) {
  await mockRepositoryA.insertSomeValue();
  if (shouldThrow) {
    throw new Error('throwing');
  }
  await mockRepositoryB.insertSomeValue();
  return {
    res: someArg1 + someArg2 + someArg3,
    mockRepositoryA,
    mockRepositoryB,
    logger,
  };
};

mockUsecaseWithoutTrx.NEED_TRX = false;

export { mockUsecaseWithoutTrx };
