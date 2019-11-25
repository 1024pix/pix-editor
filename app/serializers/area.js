import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({

  attrs:{
    name:"Nom",
    code:"Code",
    competences:"Competences (identifiants)"
  },

  payloadKeyFromModelName: function() {
    return 'Domaines';
  }
  });
