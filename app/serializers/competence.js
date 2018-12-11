import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: {
    name:'Référence',
    code:'Sous-domaine',
    rawTubes:'Tubes'
  },
  payloadKeyFromModelName: function() {
    return 'Competences';
  }
});
