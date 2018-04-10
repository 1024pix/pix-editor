import ApplicationSerializer from "./application";

export default ApplicationSerializer.extend({
  attrs:{
    name:"Nom",
    clue:"Indice",
    status:"Statut de l'indice",
    challengeIds:"Epreuves",
    description:"Description",
    tutoSolutionIds: "Comprendre",
    tutoMoreIds: "En savoir plus"
  },
  payloadKeyFromModelName: function() {
    return "Acquis";
  }
});
