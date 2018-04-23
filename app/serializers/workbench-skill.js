import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs:{
    skillId:"Acquis prod",
    challengeIds:"Epreuves",
    name:"Nom"
  },
  payloadKeyFromModelName: function() {
    return "Acquis";
  }
});
