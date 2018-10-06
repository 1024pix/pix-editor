import DS from 'ember-data';
import {computed} from '@ember/object';

export default DS.Model.extend({
  init() {
    this._super(...arguments);
    this.tutoMore = [];
    this.tutoSolutions = [];
  },
  name: DS.attr(),
  challenges:DS.hasMany('challenge'),
  competence: DS.attr(),
  challengeIds: DS.attr(),
  clue:DS.attr(),
  clueStatus:DS.attr(),
  description:DS.attr(),
  descriptionStatus:DS.attr(),
  tutoSolutionIds:DS.attr(),
  tutoMoreIds:DS.attr(),
  tubeId:DS.attr(),
  level:DS.attr(),
  workbenchSkill:DS.belongsTo('workbenchSkill'),
  workbenchChallenges:computed('workbenchSkill', function() {
    return DS.PromiseArray.create({
      promise:this.get('workbenchSkill')
        .then((skill) => {
          if (skill) {
            return skill.get('challenges')
          } else {
            return [];
          }
        })
    });
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
  }),
  template:computed('challenges.[]', function() {
    return DS.PromiseObject.create({
      promise:this.get('challenges')
      .then((challenges) => {
        return challenges.find((challenge) => {
          return challenge.get('validated')&&challenge.get('template');
        });
      })
    });
  }),
  alternatives:computed('challenges.[]', function() {
    return DS.PromiseArray.create({
      promise:this.get('challenges')
      .then((challenges) => {
        return challenges.filter((challenge) => {
          return (!challenge.get('isArchived') && !challenge.get('template'));
        });
      })
    });
  }),
  alternativesCount:computed('alternatives.[]', function() {
    return DS.PromiseObject.create({
      promise:this.get('alternatives')
        .then(alternatives => {
          return alternatives.length;
        })
    });
  }),
  workbenchAlternatives:computed('workbenchChallenges.[]', function() {
    return DS.PromiseArray.create({
      promise:this.get('workbenchChallenges')
        .then((challenges) => {
          return challenges.filter((challenge) => {
            return (!challenge.get('isArchived') && !challenge.get('template'));
          });
        })
    });
  }),
  workbenchAlternativesCount:computed('workbenchAlternatives.[]', function() {
    return DS.PromiseObject.create({
      promise:this.get('workbenchAlternatives')
        .then(alternatives => {
          return alternatives.length;
        })
    });
  }),
  loaded:computed('challenges.[]', function() {
    return this.get('challenges')
    .then(() => {
      return true;
    });
  }),
  refresh() {
    return this.hasMany('challenges').reload();
  }
});
