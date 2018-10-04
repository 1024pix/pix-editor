import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs:{
    skill:"Acquis prod",
    challenges:"Epreuves",
    name:"Nom"
  },
  payloadKeyFromModelName: function() {
    return "Acquis";
  }
});
