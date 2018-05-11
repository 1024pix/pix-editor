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
  competence: DS.attr(),
  challengeIds: DS.attr(),
  clue:DS.attr(),
  clueStatus:DS.attr(),
  description:DS.attr(),
  descriptionStatus:DS.attr(),
  tutoSolutionIds:DS.attr(),
  tutoMoreIds:DS.attr(),
  template: null,
  workbenchCount:computed("workbenchChallenges", function() {
    return this.get("workbenchChallenges").get('length');
  }),
  descriptionCSS:computed("descriptionStatus" , function() {
    let status = this.get("descriptionStatus");
    if (!status) {
      return "suggested";
    } else {
      return this._getCSSFromStatus(status);
    }
  }),
  clueCSS:computed("clueStatus" , function() {
    let status = this.get("clueStatus");
    if (!status) {
      return "suggested";
    } else {
      return this._getCSSFromStatus(status);
    }
  }),
  _getCSSFromStatus(status) {
    switch(status) {
      case "pré-validé":
        return "prevalidated";
      case "Validé":
        return "validated";
      case "à soumettre":
        return "to-be-submitted";
      case "à retravailler":
        return "need-work";
      case "Proposé":
        return "suggested";
      case "archivé":
        return "archived";
      case "inapplicable":
        return "na";
    }
    return "suggested";
  },
  tutoSolutionCount:computed("tutoSolutionIds", function() {
    let ids = this.get("tutoSolutionIds");
    if (ids) {
      return ids.length;
    } else {
      return 0;
    }
  }),
  tutoMoreCount:computed("tutoMoreIds", function() {
    let ids = this.get("tutoMoreIds");
    if (ids) {
      return ids.length;
    } else {
      return 0;
    }
  })
});
