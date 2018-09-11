import ApplicationSerializer from "./application";

export default ApplicationSerializer.extend({
  attrs:{
    name:"Nom",
    clue:"Indice",
    clueStatus:"Statut de l'indice",
    challengeIds:"Epreuves",
    description:"Description",
    descriptionStatus:"Statut de la description",
    tutoSolutionIds: "Comprendre",
    tutoMoreIds: "En savoir plus",
    competence:"Compétence",
    tubeId:"Tube",
    level:"Level"
  },
  payloadKeyFromModelName: function() {
    return "Acquis";
  }
});
