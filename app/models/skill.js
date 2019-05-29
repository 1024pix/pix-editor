import DS from 'ember-data';
import {computed} from '@ember/object';

export default DS.Model.extend({
  init() {
    this._super(...arguments);
    this.tutoMore = [];
    this.tutoSolutions = [];
  },
  name: DS.attr('string', {readOnly:true}),
  tube: DS.belongsTo('tube'),
  challenges:DS.hasMany('challenge'),
  competence: DS.attr(),
  clue:DS.attr(),
  clueStatus:DS.attr(),
  description:DS.attr(),
  descriptionStatus:DS.attr(),
  tutoSolutionIds:DS.attr(),
  tutoMoreIds:DS.attr(),
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
  clueNA:computed("clueStatus", function() {
    return (this.get("clueStatus") === "inapplicable");
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
        .then(challenges => challenges.filter((challenge) => challenge.get('isTemplate')))
    })
  }),
  sortedTemplates:computed('templates.[]', function() {
    return DS.PromiseArray.create({
      promise:this.get('templates')
        .then(templates => templates.sort((a, b) => a.get("version")<b.get("version")))
    })
  }),
  productionTemplate:computed('templates.@each.isValidated', function() {
    return DS.PromiseObject.create({
      promise:this.get('templates')
      .then(templates => templates.find(template => template.get('isValidated')))
    });
  }),
  draftTemplates:computed('templates.@each.isValidated', function() {
    return DS.PromiseArray.create({
      promise:this.get('templates')
      .then(templates => templates.filter((template) => !template.get('isValidated')))
    });
  }),
  alternatives:computed('challenges.[]', function() {
    return DS.PromiseArray.create({
      promise:this.get('challenges')
      .then(challenges => challenges.filter((challenge) => !challenge.get('isTemplate')))
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
  },
  isActive:computed('status', function() {
    return this.get('status') === 'actif';
  }),
  activate() {
    this.set('status', 'actif');
    return this.save();
  },
  deactivate() {
    this.set('status', 'en construction');
    return this.save();
  }
});
