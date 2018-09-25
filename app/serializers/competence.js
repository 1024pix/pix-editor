import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: {
    name:"Référence",
    code:"Sous-domaine",
    tubes:"Tubes"
  },
  payloadKeyFromModelName: function() {
    return 'Competences';
  }
});
