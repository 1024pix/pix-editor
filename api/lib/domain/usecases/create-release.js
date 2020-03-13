module.exports = async function createRelease(
  {
    areaDatasource,
    competenceDatasource,
    challengeDatasource,
    tubeDatasource,
    courseDatasource,
    skillDatasource,
    tutorialDatasource,
  } = {}) {
  const id = '2020-03-02:fr';
  const content = {
    areas: await areaDatasource.list(),
    competences: await competenceDatasource.list(),
    challenges: await challengeDatasource.list(),
    tubes: await tubeDatasource.list(),
    courses: await courseDatasource.list(),
    skills: await skillDatasource.list(),
    tutorials: await tutorialDatasource.list(),
  };
  return { id, content };
};
