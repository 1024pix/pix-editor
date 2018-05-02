import DS from 'ember-data';
import {computed} from '@ember/object';

export default DS.Model.extend({
  init() {
    this._super(...arguments);
    this.challenges = [];
    this.workbenchChallenges = [];
    this.tutoMore = [];
    this.tutoSolutions = [];
  },
  name: DS.attr(),
  competence: null,
  challengeIds: DS.attr(),
  clue:DS.attr(),
  clueStatus:DS.attr(),
  description:DS.attr(),
  descriptionStatus:DS.attr(),
  tutoSolutionIds:DS.attr(),
  tutoMoreIds:DS.attr(),
  template: null,
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
