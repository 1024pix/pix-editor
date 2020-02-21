import classic from 'ember-classic-decorator';
import {computed} from '@ember/object';
import {inject as service} from '@ember/service';
import Model, { attr, hasMany } from '@ember-data/model';

@classic
export default class ChallengeModel extends Model {

  @attr instructions;
  @attr type;
  @attr format;
  @attr suggestion;
  @attr answers;
  @attr t1;
  @attr t2;
  @attr t3;
  @attr illustration;
  @attr attachments;
  @attr pedagogy;
  @attr author;
  @attr declinable;
  @attr('number') version;
  @attr genealogy;
  @attr({readOnly:true}) skillNames;
  @attr status;
  @attr({readOnly:true}) preview;
  @attr pixId;
  @attr scoring;
  @attr('number') timer;
  @attr embedURL;
  @attr embedTitle;
  @attr('number') embedHeight;
  @attr('number') alternativeVersion;
  @attr accessibility1;
  @attr accessibility2;
  @attr spoil;
  @attr responsive;
  @attr alternativeText;
  @attr language;
  @attr area;
  @attr({readOnly:true}) _definedBaseName;

  @hasMany('skill') skills;

  @service('store')
  myStore;

  @service
  config;

  @service
  idGenerator;

  @computed('genealogy')
  get isTemplate() {
    return (this.get('genealogy') === 'Prototype 1');
  }

  @computed('firstSkill')
  get isWorkbench() {
    const skill = this.get('firstSkill');
    if (skill) {
      return skill.get('name') === '@workbench';
    }
    return false;
  }

  @computed('status')
  get isValidated() {
    const status = this.get('status');
    return ['validé', 'validé sans test', 'pré-validé'].includes(status);
  }

  @computed('status')
  get isSuggested() {
    const status = this.get('status');
    return status === 'proposé';
  }

  @computed('declinable')
  get notDeclinable() {
    let declinable = this.get('declinable');
    return (declinable && declinable === 'non');
  }

  @computed('status')
  get statusCSS() {
    let status = this.get('status');
    switch (status) {
      case 'validé':
      case 'validé sans test':
      case 'pré-validé':
        return 'validated';
      case 'proposé':
        return 'suggested';
      case 'archive':
        return 'archived';
      default:
        return '';
     }
  }

  @computed('status')
  get isArchived() {
    let status = this.get('status');
    return (status === 'archive');
  }
  @computed('isTemplate','version', 'isWorkbench', 'firstSkill.alternatives')
  get alternatives() {
    if (!this.get('isTemplate') || this.get('isWorkbench')) {
      return [];
    }
    let currentVersion = this.get('version');
    const skill = this.get('firstSkill');
    if (skill){
      return skill.get('alternatives').filter(alternative => {
          return (alternative.get('version') === currentVersion);
        }).sort((a, b) => {
          return a.get('alternativeVersion')>b.get('alternativeVersion');
        });
    } else {
      return [];
    }
  }

  @computed('skills')
  get firstSkill() {
    return this.get('skills.firstObject');
  }

  @computed('isTemplate','version', 'firstSkill.templates')
  get template() {
    if (this.get('isTemplate')) {
      return null;
    }
    let currentVersion = this.get('version');
    const skill = this.get('firstSkill');
    if (skill) {
      return skill.get('templates').find(template => {
        return (template.get('version') === currentVersion);
      });
    }
    return null;
  }

  @computed('alternatives.@each.isValidated')
  get productionAlternatives() {
    return this.get('alternatives').filter(alternative => {
      return alternative.get('isValidated');
    });
  }

  @computed('alternatives.@each.isValidated')
  get draftAlternatives() {
    return this.get('alternatives').filter(alternative => {
      return !alternative.get('isValidated');
    });
  }

  @computed('type')
  get isTextBased() {
    let type = this.get('type');
    return ['QROC','QROCM','QROCM-ind','QROCM-dep'].includes(type);
  }

  @computed('type')
  get supportsScoring() {
    return this.get('type') === 'QROCM-dep';
  }

  @computed('timer')
  get timerOn() {
    let timer = this.get('timer');
    return (timer && timer>0)?true:false;
  }

  set timerOn(value) {
  let timer = this.get('timer');
    if (value) {
      if (!timer || timer === 0) {
        this.set('timer', 1);
      }
    } else {
      if (timer && timer > 0) {
        this.set('timer', 0);
      }
    }
    return value;
  }

  @computed('author')
  get authorText() {
    let author = this.get('author');
    if (author) {
      return author.join(', ');
    }
    return '';
  }

  @computed('skills')
  get skillLevels() {
    const skills = this.get('skills');
    return skills.map(skill => skill.get('level'));
  }

  @computed('_definedBaseName', 'attachments.[]')
  get attachmentBaseName() {
    if (this.get('_definedBaseName')) {
      return this.get('_definedBaseName');
    }
    const attachments = this.get('attachments');
    if (attachments && attachments.length > 0) {
      return attachments[0].filename.replace(/\.[^/.]+$/, "");
    }
    return null;
  }

  set attachmentBaseName(value) {
    this.set('_definedBaseName', value);
    return value;
  }

  archive() {
    this.set('status', 'archive');
    return this.save();
  }

  validate() {
    this.set('status', 'validé');
    return this.save();
  }

  clone() {
    let ignoredFields = ['skills', 'author'];
    if (this.get('isTemplate')) {
      ignoredFields.push('version');
    } else {
      ignoredFields.push('alternativeVersion');
    }
    let data = this._getJSON(ignoredFields);
    data.status = 'proposé';
    data.author = [this.get('config').get('author')];
    data.skills = this.get('skills');
    data.pixId = this.get('idGenerator').newId();
    return this.get('myStore').createRecord(this.constructor.modelName, data);
  }

  derive() {
    const alternative = this.clone();
    alternative.set('version', this.get('version'));
    alternative.set('genealogy', 'Décliné 1');
    return alternative;
  }

  getNextAlternativeVersion() {
    return this.get('alternatives').reduce((current, alternative) => {
      const version = alternative.get('alternativeVersion');
      if (!isNaN(version)) {
        return Math.max(current, version);
      } else {
        return current;
      }
    }, 0)+1;
  }



  baseNameUpdated() {
    return Object.keys(this.changedAttributes()).includes('_definedBaseName');
  }

  _getJSON(fieldsToRemove) {
    let data = this.toJSON({includeId:false});
    delete data.pixId;
    if (data.illustration) {
      let illustration = data.illustration[0];
      data.illustration = [{url:illustration.url, filename:illustration.filename}];
    }
    if (data.attachments) {
      data.attachments = data.attachments.map(value => {
        return {url:value.url, filename:value.filename};
      })
    }
    if (fieldsToRemove) {
      fieldsToRemove.forEach((current) => {
        if (data[current]) {
          delete data[current];
        }
      });
    }
    return data;
  }

}
