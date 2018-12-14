import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({

  attrs:{
    name:"Nom",
    access:"Accès"
  },

  payloadKeyFromModelName: function() {
    return 'Auteurs';
  }
});
