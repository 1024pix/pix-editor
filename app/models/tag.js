import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr(),
  description: DS.attr(),
  notes: DS.attr(),
  // attachment: DS.attr(),
  skills: DS.hasMany('skill'),
  tutorials: DS.hasMany('tutorial'),
});
