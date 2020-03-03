module.exports = async function createRelease({ areaRepository, competenceRepository } = {}) {
  const id = '2020-03-02:fr';
  const content = {
    areas: await areaRepository.list(),
    competences: await competenceRepository.list()
  };
  return { id, content };
};
