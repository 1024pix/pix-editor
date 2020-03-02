module.exports = async function createRelease({ areaRepository } = {}) {
  const id = '2020-03-02:fr';
  const content = {
    areas: await areaRepository.list()
  };
  return { id, content };
};
