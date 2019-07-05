import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr(),
  duration: DS.attr(),
  source: DS.attr(),
  format: DS.attr(),
  link: DS.attr(),
  license: DS.attr(),
  tags: DS.attr(),
  level: DS.attr(),
  date: DS.attr(),
  crush: DS.attr(),
});
