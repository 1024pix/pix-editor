import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: {
    name: "Nom",
    title: "Titre",
    description: "Description",
    practicalTitle: "Titre pratique",
    practicalDescription: "Description pratique",
    competence: "Competences",
    rawSkills: "Acquis"
  },
  payloadKeyFromModelName: function () {
    return 'Tubes';
  }
});
