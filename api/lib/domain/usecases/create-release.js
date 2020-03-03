module.exports = async function createRelease({ areaDatasource, competenceDatasource } = {}) {
  const id = '2020-03-02:fr';
  const content = {
    areas: await areaDatasource.list(),
    competences: await competenceDatasource.list()
  };
  return { id, content };
};
