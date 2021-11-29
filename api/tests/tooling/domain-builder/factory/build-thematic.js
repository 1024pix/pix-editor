module.exports = function buildThematic(
  {
    id = 'recFvllz2Ckz',
    name = 'Nom de la thématique',
    competenceId = 'recCompetence0',
    tubeIds = ['recTube0'],
    index = 0
  } = {}) {
  return {
    id,
    name,
    competenceId,
    tubeIds,
    index,
  };
};
