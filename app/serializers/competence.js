import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: {
    name:'Référence',
    title:'Titre',
    code:'Sous-domaine',
    rawTubes:'Tubes',
    description:'Description'
  },
  payloadKeyFromModelName: function() {
    return 'Competences';
  }
});
