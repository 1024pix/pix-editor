import {inject as service} from '@ember/service';
import Model, { attr, hasMany } from '@ember-data/model';

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
  @attr languages;
  @attr area;
  @attr({readOnly:true}) _definedBaseName;

  @hasMany('skill') skills;

  @service('store') myStore;
  @service config;
  @service idGenerator;

  get isTemplate() {
    return (this.genealogy === 'Prototype 1');
  }

  get isWorkbench() {
    const skill = this.firstSkill;
    if (skill) {
      return skill.name === '@workbench';
    }
    return false;
  }

  get isValidated() {
    const status = this.status;
    return ['validé', 'validé sans test', 'pré-validé'].includes(status);
  }

  get isSuggested() {
    return this.status === 'proposé';
  }

  get notDeclinable() {
    const declinable = this.declinable;
    return (declinable && declinable === 'non');
  }

  get statusCSS() {
    const status = this.status;
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

  get isArchived() {
    const status = this.status;
    return (status === 'archive');
  }
  get alternatives() {
    if (!this.isTemplate || this.isWorkbench) {
      return [];
    }
    let currentVersion = this.version;
    const skill = this.firstSkill;
    if (skill) {
      return skill.alternatives.filter(alternative => {
          return (alternative.version === currentVersion);
        }).sort((a, b) => {
          return a.alternativeVersion>b.alternativeVersion;
        });
    } else {
      return [];
    }
  }

  get firstSkill() {
    return this.skills.firstObject;
  }

  get template() {
    if (this.isTemplate) {
      return null;
    }
    const currentVersion = this.version;
    const skill = this.firstSkill;
    if (skill) {
      return skill.templates.find(template => (template.version === currentVersion));
    }
    return null;
  }

  get productionAlternatives() {
    return this.alternatives.filter(alternative => alternative.isValidated);
  }

  get draftAlternatives() {
    return this.alternatives.filter(alternative => !alternative.isValidated);
  }

  get isTextBased() {
    const type = this.type;
    return ['QROC','QROCM','QROCM-ind','QROCM-dep'].includes(type);
  }

  get supportsScoring() {
    return this.type === 'QROCM-dep';
  }

  get timerOn() {
    let timer = this.timer;
    return (timer && timer>0)?true:false;
  }

  set timerOn(value) {
  let timer = this.timer;
    if (value) {
      if (!timer || timer === 0) {
        this.timer = 1;
      }
    } else {
      if (timer && timer > 0) {
        this.timer = 0;
      }
    }
    return value;
  }

  get authorText() {
    const author = this.author;
    if (author) {
      return author.join(', ');
    }
    return '';
  }

  get skillLevels() {
    return this.skills.map(skill => skill.level);
  }

  get attachmentBaseName() {
    if (this._definedBaseName) {
      return this._definedBaseName;
    }
    const attachments = this.attachments;
    if (attachments && attachments.length > 0) {
      return attachments[0].filename.replace(/\.[^/.]+$/, '');
    }
    return null;
  }

  set attachmentBaseName(value) {
    this._definedBaseName = value;
    return value;
  }

  archive() {
    this.status = 'archive';
    return this.save();
  }

  validate() {
    this.status = 'validé';
    return this.save();
  }

  invalidate() {
    this.status = 'proposé';
    return this.save();
  }

  clone() {
    let ignoredFields = ['skills', 'author'];
    if (this.isTemplate) {
      ignoredFields.push('version');
    } else {
      ignoredFields.push('alternativeVersion');
    }
    let data = this._getJSON(ignoredFields);
    data.status = 'proposé';
    data.author = [this.config.author];
    data.skills = this.skills;
    data.pixId = this.idGenerator.newId();
    return this.myStore.createRecord(this.constructor.modelName, data);
  }

  derive() {
    const alternative = this.clone();
    alternative.version = this.version;
    alternative.genealogy = 'Décliné 1';
    return alternative;
  }

  getNextAlternativeVersion() {
    return this.alternatives.reduce((current, alternative) => {
      const version = alternative.alternativeVersion;
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
