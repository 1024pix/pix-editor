import DS from 'ember-data';
import {computed} from '@ember/object';
import {inject as service} from '@ember/service';

export default DS.Model.extend({
  skills:DS.hasMany('skill'),
  instructions:DS.attr(),
  type:DS.attr(),
  format:DS.attr(),
  suggestion:DS.attr(),
  answers:DS.attr(),
  t1:DS.attr(),
  t2:DS.attr(),
  t3:DS.attr(),
  illustration:DS.attr(),
  attachments:DS.attr(),
  pedagogy:DS.attr(),
  author:DS.attr(),
  declinable:DS.attr(),
  version:DS.attr('number'),
  genealogy:DS.attr(),
  skillNames:DS.attr({readOnly:true}),
  status:DS.attr(),
  preview:DS.attr({readOnly:true}),
  pixId:DS.attr(),
  scoring:DS.attr(),
  timer:DS.attr('number'),
  embedURL:DS.attr(),
  embedTitle:DS.attr(),
  embedHeight:DS.attr('number'),
  alternativeVersion:DS.attr('number'),
  accessibility1:DS.attr(),
  accessibility2:DS.attr(),
  spoil:DS.attr(),
  responsive:DS.attr(),
  alternativeText:DS.attr(),
  language:DS.attr(),
  area:DS.attr(),
  myStore:service('store'),
  config:service(),
  idGenerator:service(),
  _definedBaseName:DS.attr({readOnly:true}),
  isTemplate:computed('genealogy', function(){
    return (this.get('genealogy') === 'Prototype 1');
  }),
  isWorkbench:computed('firstSkill', function() {
    const skill = this.get('firstSkill');
    if (skill) {
      return skill.get('name') === '@workbench';
    }
    return false;
  }),
  isValidated:computed('status', function(){
    let status = this.get('status');
    return ['validé', 'validé sans test', 'pré-validé'].includes(status);
  }),
  isSuggested:computed('status', function() {
    let status = this.get('status');
    return status === 'proposé';
  }),
  notDeclinable:computed('declinable', function() {
    let declinable = this.get('declinable');
    return (declinable && declinable === 'non');
  }),
  statusCSS:computed('status', function() {
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
  }),
  isArchived: computed('status', function() {
    let status = this.get('status');
    return (status === 'archive');
  }),
  archive() {
    this.set('status', 'archive');
    return this.save();
  },
  validate() {
    this.set('status', 'validé');
    return this.save();
  },
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
  },
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
  },
  derive() {
    const alternative = this.clone();
    alternative.set('version', this.get('version'));
    alternative.set('genealogy', 'Décliné 1');
    return alternative;
  },
  alternatives:computed('isTemplate','version', 'isWorkbench', 'firstSkill.alternatives', function() {
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
  }),
  firstSkill:computed('skills', function() {
    return this.get('skills.firstObject');
  }),
  template:computed('isTemplate','version', 'firstSkill.templates', function() {
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
  }),
  productionAlternatives:computed('alternatives.@each.isValidated', function() {
    return this.get('alternatives').filter(alternative => {
      return alternative.get('isValidated');
    });
  }),
  draftAlternatives:computed('alternatives.@each.isValidated', function() {
    return this.get('alternatives').filter(alternative => {
      return !alternative.get('isValidated');
    });
  }),
  getNextAlternativeVersion() {
    return this.get('alternatives').reduce((current, alternative) => {
      const version = alternative.get('alternativeVersion');
      if (!isNaN(version)) {
        return Math.max(current, version);
      } else {
        return current;
      }
    }, 0)+1;
  },
  isTextBased:computed('type', function() {
    let type = this.get('type');
    return ['QROC','QROCM','QROCM-ind','QROCM-dep'].includes(type);
  }),
  supportsScoring:computed('type', function() {
    return this.get('type') === 'QROCM-dep';
  }),
  timerOn:computed('timer', {
    get() {
      let timer = this.get('timer');
      return (timer && timer>0)?true:false;
    },
    set(key, value) {
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
  }),
  authorText:computed('author', function() {
    let author = this.get('author');
    if (author) {
      return author.join(', ');
    }
    return '';
  }),
  skillLevels:computed('skills', function() {
    const skills = this.get('skills');
    return skills.map(skill => skill.get('level'));
  }),
  attachmentBaseName:computed('_definedBaseName', 'attachments.[]', {
    get() {
      if (this.get('_definedBaseName')) {
        return this.get('_definedBaseName');
      }
      const attachments = this.get('attachments');
      if (attachments && attachments.length > 0) {
        return attachments[0].filename.replace(/\.[^/.]+$/, "");
      }
      return null;
    },
    set(key, value) {
      this.set('_definedBaseName', value);
      return value;
    }
  }),
  baseNameUpdated() {
    return Object.keys(this.changedAttributes()).includes('_definedBaseName');
  }
});
