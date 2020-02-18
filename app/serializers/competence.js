import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
primaryKey: 'Record ID',
  attrs: {
    name:'Référence',
    title:'Titre',
    code:'Sous-domaine',
    rawTubes:'Tubes',
    description:'Description',
    pixId:'id persistant'
  },
  payloadKeyFromModelName: function() {
    return 'Competences';
  }
});
