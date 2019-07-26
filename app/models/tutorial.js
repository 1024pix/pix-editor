import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr(),
  duration: DS.attr(),
  source: DS.attr(),
  format: DS.attr(),
  link: DS.attr(),
  license: DS.attr(),
  tags: DS.hasMany('tag'),
  level: DS.attr(),
  date: DS.attr(),
  crush: DS.attr(),
  tutoSolution:DS.hasMany('skill', {inverse : 'tutoSolution'}),
  tutoMore:DS.hasMany('skill', {inverse: 'tutoMore'})
});
