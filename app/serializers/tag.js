import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: {
    title: 'Nom',
    description: 'Description',
    notes: 'Notes',
    skills: 'Acquis',
    tutorials: 'Tutoriels',
  },

  payloadKeyFromModelName: function() {
    return 'Tags';
  }

});
