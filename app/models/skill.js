import DS from 'ember-data';
import {computed} from '@ember/object';

export default DS.Model.extend({
  init() {
    this._super(...arguments);
    this.set('_pinnedRelationships', {})
  },
  name: DS.attr('string', {readOnly: true}),
  tube: DS.belongsTo('tube'),
  challenges: DS.hasMany('challenge'),
  competence: DS.attr(),
  clue: DS.attr(),
  clueStatus: DS.attr(),
  description: DS.attr(),
  descriptionStatus: DS.attr(),
  tutoSolution: DS.hasMany('tutorial'),
  tutoMore: DS.hasMany('tutorial'),
  level: DS.attr(),
  status: DS.attr(),
  pixId:DS.attr(),
  i18n: DS.attr(),
  descriptionCSS: computed("descriptionStatus", function () {
    let status = this.get("descriptionStatus");
    if (!status) {
      return "suggested";
    } else {
      return this._getCSSFromStatus(status);
    }
  }),
  clueCSS: computed("clueStatus", function () {
    let status = this.get("clueStatus");
    if (!status) {
      return "suggested";
    } else {
      return this._getCSSFromStatus(status);
    }
  }),
  clueNA: computed("clueStatus", function () {
    return (this.get("clueStatus") === "inapplicable");
  }),
  _getCSSFromStatus(status) {
    switch (status) {
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
  tutoSolutionCount: computed("tutoSolution", function () {
    let ids = this.get("tutoSolution");
    if (ids) {
      return ids.length;
    } else {
      return 0;
    }
  }),
  tutoMoreCount: computed("tutoMore", function () {
    let ids = this.get("tutoMore");
    if (ids) {
      return ids.length;
    } else {
      return 0;
    }
  }),
  templates: computed('challenges.[]', function () {
    return this.get('challenges').filter((challenge) => challenge.get('isTemplate'));
  }),
  sortedTemplates: computed('templates.[]', function () {
    return this.get('templates').sort((a, b) => a.get("version") < b.get("version"));
  }),
  productionTemplate: computed('templates.@each.isValidated', function () {
    return this.get('templates').find(template => template.get('isValidated'));
  }),
  draftTemplates: computed('templates.@each.isValidated', function () {
    return this.get('templates').filter((template) => !template.get('isValidated'));
  }),
  alternatives: computed('challenges.[]', function () {
    return this.get('challenges').filter((challenge) => !challenge.get('isTemplate'));
  }),
  getNextVersion() {
    return this.get('templates').reduce((current, template) => {
      let version = template.get("version");
      if (version > current) {
        return version;
      }
      return current;
    }, 0) + 1;
  },
  isActive: computed('status', function () {
    return this.get('status') === 'actif';
  }),
  activate() {
    this.set('status', 'actif');
    return this.save();
  },
  deactivate() {
    this.set('status', 'en construction');
    return this.save();
  },
  pinRelationships() {
    const requests = [this.get('tutoSolution'), this.get('tutoMore')];
    return Promise.all(requests)
    .then(tutorials => {
      this.set('_pinnedRelationships', {
        tutoSolution:tutorials[0].toArray(),
        tutoMore:tutorials[1].toArray()
      });
    })
  },
  rollbackAttributes(){
    this._super(...arguments);
    let tutoSolution = this.get('_pinnedRelationships.tutoSolution');
    this.set('tutoSolution', tutoSolution);
    let tutoMore = this.get('_pinnedRelationships.tutoMore');
    this.set('tutoMore', tutoMore);
  },

  save() {
    return this._super(...arguments)
      .then(result => {
        this.pinRelationships();
        return result;
      })
  }

});
