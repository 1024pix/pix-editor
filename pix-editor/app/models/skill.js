import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { tracked } from '@glimmer/tracking';

export default class SkillModel extends Model {

  _pinnedRelationships = {};

  @attr('string', {readOnly: true}) name;
  @attr competence;
  @attr clue;
  @attr clueFr;
  @attr clueEn;
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

  get descriptionCSS() {
    const status = this.descriptionStatus;
    if (!status) {
      return 'suggested';
    } else {
      return this._getCSSFromStatus(status);
    }
  }

  get clueCSS() {
    const status = this.clueStatus;
    if (!status) {
      return 'suggested';
    } else {
      return this._getCSSFromClueStatus(status);
    }
  }

  get clueNA() {
    return (this.clueStatus === 'inapplicable');
  }

  get tutoSolutionCount() {
    const ids = this.tutoSolution;
    if (ids) {
      return ids.length;
    } else {
      return 0;
    }
  }

  get tutoMoreCount() {
    const ids = this.tutoMore;
    if (ids) {
      return ids.length;
    } else {
      return 0;
    }
  }

  get templates() {
    return this.challenges.filter(challenge => challenge.isTemplate);
  }

  get sortedTemplates() {
    return this.templates.sort((a, b) => a.version < b.version);
  }

  get productionTemplate() {
    return this.templates.find(template => template.isValidated);
  }

  get productionTemplates() {
    return this.templates.filter(template => template.isValidated);
  }

  get draftTemplates() {
    return this.templates.filter(template => !template.isValidated);
  }

  get alternatives() {
    return this.challenges.filter(challenge => !challenge.isTemplate);
  }

  get isActive() {
    return this.status === 'actif';
  }

  getNextVersion() {
    return this.templates.reduce((current, template) => {
      let version = template.version;
      if (version > current) {
        return version;
      }
      return current;
    }, 0) + 1;
  }

  activate() {
    this.status = 'actif';
    return this.save();
  }

  deactivate() {
    this.status = 'en construction';
    return this.save();
  }

  pinRelationships() {
    const requests = [this.tutoSolution, this.tutoMore];
    return Promise.all(requests)
      .then(tutorials => {
        this._pinnedRelationships = {
          tutoSolution: tutorials[0].toArray(),
          tutoMore: tutorials[1].toArray()
        };
      })
  }

  rollbackAttributes() {
    super.rollbackAttributes(...arguments);
    const tutoSolution = this._pinnedRelationships.tutoSolution;
    this.tutoSolution = tutoSolution;
    const tutoMore = this._pinnedRelationships.tutoMore;
    this.tutoMore = tutoMore;
  }

  save() {
    return super.save(...arguments)
      .then(result => {
        this.pinRelationships();
        return result;
      });
  }

  archive() {
    this.status = 'périmé';
    return this.save();
  }

  _getCSSFromStatus(status) {
    switch (status) {
      case 'en contruction':
        return 'building';
      case 'actif':
        return 'active';
      case 'périmé':
        return 'out-of-date';
      case 'archivé':
        return 'archived';
    }
    return 'suggested';
  }

  _getCSSFromClueStatus(status) {
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
