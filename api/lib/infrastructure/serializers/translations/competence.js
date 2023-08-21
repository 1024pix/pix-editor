module.exports = {
  serialize(competence) {
    const translations =  [];
    translations.push({
      key: `competence.${competence['id persistant']}.title`,
      value:  competence['Titre fr-fr'],
      lang: 'fr'
    });
    return translations;
  }
};
