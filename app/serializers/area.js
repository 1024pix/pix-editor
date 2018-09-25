import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({

  attrs:{
    name:"Nom",
    competences:"Competences (identifiants)"
  },

  payloadKeyFromModelName: function() {
    return 'Domaines';
  }
  });
