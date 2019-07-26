import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: {
    title: "Titre",
    duration: "Durée",
    source: "Source",
    format: "Format",
    link: "Lien",
    license: "License",
    tags: "Tags",
    level: "niveau",
    date: "Date maj",
    crush: "CoupDeCoeur",
    tutoSolution: "Solution à",
    tutoMore: "En savoir plus"
  },

  payloadKeyFromModelName: function() {
    return 'Tutoriels';
  }

});
