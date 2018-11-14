import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs:{
    name:"Nom",
    description:"Description",
    competenceIds:"Competences",
    rawSkills:"Acquis"
  },
  payloadKeyFromModelName: function() {
    return 'Tubes';
  }
});
