import DS from 'ember-data';

export default DS.Model.extend({
  skillId: DS.attr(),
  challenges: DS.hasMany('workbenchChallenge'),
  challengeIds: DS.attr()
});
