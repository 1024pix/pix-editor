import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({

  attrs:{
    name:"Nom",
    competenceIds:"Competences (identifiants)"
  },

  payloadKeyFromModelName: function() {
    return 'Domaines';
  }

});
