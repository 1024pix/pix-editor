import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs:{
    name:"Nom",
    description:"Description",
    competenceIds:"Competences",
    skills:"Acquis"
  },
  payloadKeyFromModelName: function() {
    return 'Tubes';
  }
});
