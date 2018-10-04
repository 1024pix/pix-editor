import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr(),
  skill: DS.belongsTo('skill', {inverse:null}),
  challenges: DS.hasMany('workbenchChallenge')
});
