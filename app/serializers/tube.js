import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  primaryKey: 'Record Id',

  attrs: {
    name: "Nom",
    title: "Titre",
    description: "Description",
    practicalTitle: "Titre pratique",
    practicalDescription: "Description pratique",
    competence: "Competences",
    rawSkills: "Acquis",
    pixId: "id persistant"
  },
  payloadKeyFromModelName: function () {
    return 'Tubes';
  }
});
