const Tube = require('../../../../lib/domain/models/Tube');

const buildTube = function({
  id = 'recTIddrkopID23Fp',
  name = '@Moteur',
  title = 'Moteur de recherche',
  description = 'Connaître le fonctionnement d\'un moteur de recherche',
  practicalTitleFrFr = 'Outils d\'accès au web',
  practicalTitleEnUs = 'Tools for web',
  practicalDescriptionFrFr = 'Identifier un navigateur web et un moteur de recherche, connaître le fonctionnement du moteur de recherche',
  practicalDescriptionEnUs = 'Identify a web browser and a search engine, know how the search engine works',
  competenceId = 'recsvLz0W2ShyfD63',
  locale = 'fr-fr',
} = {}) {
  return new Tube({
    id,
    name,
    title,
    description,
    practicalTitleFrFr,
    practicalTitleEnUs,
    practicalDescriptionFrFr,
    practicalDescriptionEnUs,
    competenceId,
  }, locale);
};

buildTube.withLocaleFr = function({
  id,
  name,
  title,
  description,
  practicalTitle,
  practicalDescription,
  competenceId,
} = {}) {
  return new Tube({
    id,
    name,
    title,
    description,
    practicalTitleFrFr: practicalTitle,
    practicalTitleEnUs: null,
    practicalDescriptionFrFr: practicalDescription,
    practicalDescriptionEnUs: null,
    competenceId,
  }, 'fr');
};

buildTube.withLocaleFrFr = function({
  id,
  name,
  title,
  description,
  practicalTitle,
  practicalDescription,
  competenceId,
} = {}) {
  return new Tube({
    id,
    name,
    title,
    description,
    practicalTitleFrFr: practicalTitle,
    practicalTitleEnUs: null,
    practicalDescriptionFrFr: practicalDescription,
    practicalDescriptionEnUs: null,
    competenceId,
  }, 'fr-fr');
};

buildTube.withLocaleEnUs = function({
  id,
  name,
  title,
  description,
  practicalTitle,
  practicalDescription,
  competenceId,
} = {}) {
  return new Tube({
    id,
    name,
    title,
    description,
    practicalTitleFrFr: null,
    practicalTitleEnUs: practicalTitle,
    practicalDescriptionFrFr: null,
    practicalDescriptionEnUs: practicalDescription,
    competenceId,
  }, 'en');
};
module.exports = buildTube;
