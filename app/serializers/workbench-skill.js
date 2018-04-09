import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs:{
    skillId:"Acquis prod",
    challengeIds:"Epreuves"
  },
  payloadKeyFromModelName: function() {
    return "Acquis";
  }
});
