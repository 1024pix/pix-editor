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
    crush: "CoupDeCoeur"
  },

  payloadKeyFromModelName: function() {
    return 'Tutoriels';
  }

});
