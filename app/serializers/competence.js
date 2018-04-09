import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({

  attrs: {
    name:"Référence",
    code:"Sous-domaine"
  },
  payloadKeyFromModelName: function() {
    return 'Competences';
  }
});
