export function buildTubeDatasourceObject(
  {
    id = 'recTIddrkopID23Fp',
    name = '@Moteur',
    title = 'Moteur de recherche',
    description = 'Connaître le fonctionnement d\'un moteur de recherche',
    practicalTitle_i18n = {
      fr: 'Outils d\'accès au web',
      en: 'Tools for web',
    },
    practicalDescription_i18n = {
      fr: 'Identifier un navigateur web et un moteur de recherche, connaître le fonctionnement du moteur de recherche',
      en: 'Identify a web browser and a search engine, know how the search engine works',
    },
    competenceId = 'recsvLz0W2ShyfD63',
  } = {}) {
  return {
    id,
    name,
    title,
    description,
    practicalTitle_i18n,
    practicalDescription_i18n,
    competenceId,
  };
}
