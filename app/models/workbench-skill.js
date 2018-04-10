import DS from 'ember-data';

export default DS.Model.extend({
  skillId: DS.attr(),
  challengeIds: DS.attr()
});
