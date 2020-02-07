import ApplicationSerializer from "./application";

export default ApplicationSerializer.extend({
  primaryKey: 'Record Id',

  attrs:{
    name:"Nom",
    clue:"Indice",
    clueStatus:"Statut de l'indice",
    challenges:"Epreuves",
    description:"Description",
    descriptionStatus:"Statut de la description",
    tutoSolution: "Comprendre",
    tutoMore: "En savoir plus",
    competence:"Compétence",
    tube:"Tube",
    level:"Level",
    status:"Status",
    i18n:"Internationalisation",
    pixId:"id"
  },
  payloadKeyFromModelName: function() {
    return "Acquis";
  }
});
