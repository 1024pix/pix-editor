const TubeForRelease = require('../../../../lib/domain/models/TubeForRelease');

const buildTubeForRelease = function({
  id = 'recTIddrkopID23Fp',
  name = '@Moteur',
  title = 'Moteur de recherche',
  description = 'Connaître le fonctionnement d\'un moteur de recherche',
  practicalTitleFrFr = 'Outils d\'accès au web',
  practicalTitleEnUs = 'Tools for web',
  practicalDescriptionFrFr = 'Identifier un navigateur web et un moteur de recherche, connaître le fonctionnement du moteur de recherche',
  practicalDescriptionEnUs = 'Identify a web browser and a search engine, know how the search engine works',
  competenceId = 'recsvLz0W2ShyfD63',
} = {}) {
  return new TubeForRelease({
    id,
    name,
    title,
    description,
    practicalTitleFrFr,
    practicalTitleEnUs,
    practicalDescriptionFrFr,
    practicalDescriptionEnUs,
    competenceId,
  });
};

module.exports = buildTubeForRelease;
