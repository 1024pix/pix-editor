import DS from 'ember-data';

export default DS.Model.extend({
  text:DS.attr(),
  challengeId:DS.attr(),
  author:DS.attr(),
  competence:DS.attr(),
  skills:DS.attr(),
  production:DS.attr(),
  createdAt:DS.attr(),
  changelog:DS.attr("boolean", {defaultValue: false })
});
