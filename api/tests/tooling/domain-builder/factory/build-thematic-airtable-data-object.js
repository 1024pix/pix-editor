module.exports = function buildThematicAirtableDataObject(
  {
    id = 'recFvllz2Ckz',
    name = 'Nom de la thématique',
    nameEnUs = 'Thematic\'s name',
    competenceId = 'recCompetence0',
    tubeIds = ['recTube0'],
    index = 0
  } = {}) {
  return {
    id,
    name,
    nameEnUs,
    competenceId,
    tubeIds,
    index,
  };
};
