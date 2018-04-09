import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({

  attrs:{
    name:"Nom",
    liteValue:"Lite"
  },

  payloadKeyFromModelName: function() {
    return 'Auteurs';
  }
});
