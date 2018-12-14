import ApplicationSerializer from "./application";

export default ApplicationSerializer.extend({
  attrs:{
    name:"Nom",
    clue:"Indice",
    clueStatus:"Statut de l'indice",
    challenges:"Epreuves",
    description:"Description",
    descriptionStatus:"Statut de la description",
    tutoSolutionIds: "Comprendre",
    tutoMoreIds: "En savoir plus",
    competence:"Compétence",
    tubeId:"Tube",
    level:"Level",
    status:"Status"
  },
  payloadKeyFromModelName: function() {
    return "Acquis";
  }
});
