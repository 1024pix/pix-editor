import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: {
    title: "Titre",
    duration: "Durée",
    source: "Source",
    format: "Format",
    link: "Lien",
    license: "License"
  },

  payloadKeyFromModelName: function() {
    return 'Tutoriels';
  }

});
