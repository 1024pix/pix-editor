module.exports = async function getAreas({ areaRepository }) {
  return areaRepository.get();
};

