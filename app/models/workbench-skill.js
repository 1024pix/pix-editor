import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr(),
  skill: DS.belongsTo('skill'),
  challenges: DS.hasMany('workbenchChallenge'),
  ready() {
    this.get('skill')
    .then((skill) => {
      skill.set('workbenchSkill', this);
    })
  }
});
