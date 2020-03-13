module.exports = async function createRelease(
  {
    areaDatasource,
    competenceDatasource,
    challengeDatasource,
    tubeDatasource,
  } = {}) {
  const id = '2020-03-02:fr';
  const content = {
    areas: await areaDatasource.list(),
    competences: await competenceDatasource.list(),
    challenges: await challengeDatasource.list(),
    tubes: await tubeDatasource.list()
  };
  return { id, content };
};
