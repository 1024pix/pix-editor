import DS from 'ember-data';
import {computed} from '@ember/object';

export default DS.Model.extend({
  name: DS.attr(),
  competence: DS.belongsTo('competence',{ readOnly: true }),
  challengeIds: DS.attr(),
  clue:DS.attr(),
  status:DS.attr(),
  description:DS.attr(),
  challenges: DS.hasMany('challenge', { readOnly: true}),
  workbenchChallenges: DS.hasMany('workbenchChallenge', { readOnly: true}),
  tutoSolutionIds:DS.attr(),
  tutoSolutions: DS.hasMany('tutorial', {readOnly:true}),
  tutoMoreIds:DS.attr(),
  tutoMore: DS.hasMany('tutorial', {readOnly:true}),
  template: DS.belongsTo('challenge', {inverse:null, readOnly:true}),
  workbenchCount:computed('workbenchChallenges', function() {
    return this.get("workbenchChallenges").get('length');
  }),
  descriptionCSS:computed("description" , function() {
    let clue = this.get("description");
    if (clue && clue.length>0) {
      return "described";
    } else {
      return "undescribed";
    }
  }),
  clueCSS:computed("status" , function() {
    let status = this.get("status");
    if (status === "Validé") {
      return "validated";
    } else {
      return "suggested";
    }
  })
});
