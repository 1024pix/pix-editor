import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr(),
  competenceIds: DS.attr(),
  competences: DS.hasMany('competence')
});
