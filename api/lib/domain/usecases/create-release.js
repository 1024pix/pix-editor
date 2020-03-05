module.exports = async function createRelease(
  {
    areaDatasource,
    competenceDatasource,
    challengeDatasource
  } = {}) {
  const id = '2020-03-02:fr';
  const content = {
    areas: await areaDatasource.list(),
    competences: await competenceDatasource.list(),
    challenges: await challengeDatasource.list()
  };
  return { id, content };
};
