import DS from 'ember-data';
import {computed} from '@ember/object';

export default DS.Model.extend({
  init() {
    this._super(...arguments);
    this.tutoMore = [];
    this.tutoSolutions = [];
  },
  name: DS.attr('string', {readonly:true}),
  challenges:DS.hasMany('challenge'),
  competence: DS.attr(),
  clue:DS.attr(),
  clueStatus:DS.attr(),
  description:DS.attr(),
  descriptionStatus:DS.attr(),
  tutoSolutionIds:DS.attr(),
  tutoMoreIds:DS.attr(),
  tubeId:DS.attr(),
  level:DS.attr(),
  status:DS.attr(),
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
  templates:computed('challenges.[]', function() {
    return DS.PromiseArray.create({
      promise:this.get('challenges')
        .then(challenges => {
          return challenges.filter((challenge) => {
            return challenge.get('isTemplate');
          })
        })
    })
  }),
  sortedTemplates:computed('templates.[]', function() {
    return DS.PromiseArray.create({
      promise:this.get('templates')
        .then(templates => {
          return templates.sort((a, b) => {
            return a.get("version")<b.get("version");
          });
        })
    })
  }),
  productionTemplate:computed('templates.@each.isValidated', function() {
    return DS.PromiseObject.create({
      promise:this.get('templates')
      .then((templates) => {
        return templates.find((template) => {
          return template.get('isValidated');
        });
      })
    });
  }),
  draftTemplates:computed('templates.@each.isValidated', function() {
    return DS.PromiseArray.create({
      promise:this.get('templates')
      .then((templates) => {
        return templates.filter((template) => {
          return !template.get('isValidated');
        });
      })
    });
  }),
  alternatives:computed('challenges.[]', function() {
    return DS.PromiseArray.create({
      promise:this.get('challenges')
      .then((challenges) => {
        return challenges.filter((challenge) => {
          return !challenge.get('isTemplate');
        });
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
  },
  getNextVersion() {
    return this.get("templates")
    .then(templates => {
      return templates.reduce((current, template) => {
        let version = template.get("version");
        if (version > current) {
          return version;
        }
        return current;
      }, 0)+1;
    });
  }
});
