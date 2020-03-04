import classic from 'ember-classic-decorator';
import {computed} from '@ember/object';
import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { tracked } from '@glimmer/tracking';

@classic
export default class SkillModel extends Model {

  init() {
    super.init(...arguments);
    this.set('_pinnedRelationships', {})
  }

  @attr('string', {readOnly: true}) name;
  @attr competence;
  @attr clue;
  @attr clueStatus;
  @attr description;
  @attr descriptionStatus;
  @attr level;
  @attr status;
  @attr pixId;
  @attr i18n;

  @belongsTo('tube')
  tube;

  @hasMany('challenge')
  challenges;

  @hasMany('tutorial')
  tutoSolution;

  @hasMany('tutorial')
  tutoMore;

  @tracked _selected = false;

  @computed('descriptionStatus')
  get descriptionCSS() {
    let status = this.get('descriptionStatus');
    if (!status) {
      return 'suggested';
    } else {
      return this._getCSSFromStatus(status);
    }
  }

  @computed('clueStatus')
  get clueCSS () {
    let status = this.get('clueStatus');
    if (!status) {
      return 'suggested';
    } else {
      return this._getCSSFromStatus(status);
    }
  }

  @computed('clueStatus')
  get clueNA() {
    return (this.get('clueStatus') === 'inapplicable');
  }

  @computed('tutoSolution')
  get tutoSolutionCount() {
    let ids = this.get('tutoSolution');
    if (ids) {
      return ids.length;
    } else {
      return 0;
    }
  }

  @computed('tutoMore')
  get tutoMoreCount() {
    let ids = this.get('tutoMore');
    if (ids) {
      return ids.length;
    } else {
      return 0;
    }
  }

  @computed('challenges.[]')
  get templates() {
    return this.get('challenges').filter((challenge) => challenge.get('isTemplate'));
  }

  @computed('templates.[]')
  get sortedTemplates() {
    return this.get('templates').sort((a, b) => a.get('version') < b.get('version'));
  }

  @computed('templates.@each.isValidated')
  get productionTemplate() {
    return this.get('templates').find(template => template.get('isValidated'));
  }

  @computed('templates.@each.isValidated')
  get draftTemplates() {
    return this.get('templates').filter((template) => !template.get('isValidated'));
  }

  @computed('challenges.[]')
  get alternatives() {
    return this.get('challenges').filter((challenge) => !challenge.get('isTemplate'));
  }

  @computed('status')
  get isActive() {
    return this.get('status') === 'actif';
  }

  getNextVersion() {
    return this.get('templates').reduce((current, template) => {
      let version = template.get('version');
      if (version > current) {
        return version;
      }
      return current;
    }, 0) + 1;
  }

  activate() {
    this.set('status', 'actif');
    return this.save();
  }

  deactivate() {
    this.set('status', 'en construction');
    return this.save();
  }

  pinRelationships() {
    const requests = [this.get('tutoSolution'), this.get('tutoMore')];
    return Promise.all(requests)
    .then(tutorials => {
      this.set('_pinnedRelationships', {
        tutoSolution:tutorials[0].toArray(),
        tutoMore:tutorials[1].toArray()
      });
    })
  }

  rollbackAttributes() {
    super.rollbackAttributes(...arguments);
    let tutoSolution = this.get('_pinnedRelationships.tutoSolution');
    this.set('tutoSolution', tutoSolution);
    let tutoMore = this.get('_pinnedRelationships.tutoMore');
    this.set('tutoMore', tutoMore);
  }

  save() {
    return super.save(...arguments)
      .then(result => {
        this.pinRelationships();
        return result;
      });
  }

  _getCSSFromStatus(status) {
    switch (status) {
      case 'pré-validé':
        return 'prevalidated';
      case 'Validé':
        return 'validated';
      case 'à soumettre':
        return 'to-be-submitted';
      case 'à retravailler':
        return 'need-work';
      case 'Proposé':
        return 'suggested';
      case 'archivé':
        return 'archived';
      case 'inapplicable':
        return 'na';
    }
    return 'suggested';
  }

}
