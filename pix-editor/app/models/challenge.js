import { inject as service } from '@ember/service';
import Model, { attr, hasMany, belongsTo } from '@ember-data/model';
import { tracked } from '@glimmer/tracking';

export default class ChallengeModel extends Model {

  @attr('string') airtableId;
  @attr instruction;
  @attr alternativeInstruction;
  @attr type;
  @attr format;
  @attr proposals;
  @attr solution;
  @attr solutionToDisplay;
  @attr t1Status;
  @attr t2Status;
  @attr t3Status;
  @attr pedagogy;
  @attr author;
  @attr declinable;
  @attr('number') version;
  @attr genealogy;
  @attr status;
  @attr({ readOnly:true }) preview;
  @attr('number') timer;
  @attr embedURL;
  @attr embedTitle;
  @attr('number') embedHeight;
  @attr('number') alternativeVersion;
  @attr accessibility1;
  @attr accessibility2;
  @attr spoil;
  @attr responsive;
  @attr ({ defaultValue: function() { return []; } }) locales;
  @attr alternativeLocales;
  @attr geography;
  @attr autoReply;
  @attr focusable;
  @attr illustrationAlt;
  @attr('date') updatedAt;
  @attr('date') validatedAt;
  @attr('date') archivedAt;
  @attr('date') madeObsoleteAt;
  @attr('boolean') shuffled;
  @attr ({ defaultValue: function() { return []; } }) contextualizedFields;

  @belongsTo('skill') skill;
  @hasMany('attachment', { inverse: 'challenge' }) files;
  @hasMany('localized-challenge', { inverse: 'challenge' }) localizedChallenges;

  @service('store') myStore;
  @service config;
  @service idGenerator;

  @tracked _definedBaseName;

  get illustration() {
    return this.files.find((file) => file.type === 'illustration' && !file.isDeleted);
  }

  get attachments() {
    return this.files.filter((file) => file.type === 'attachment' && !file.isDeleted);
  }

  get isPrototype() {
    return (this.genealogy === 'Prototype 1');
  }

  get isWorkbench() {
    const skill = this.skill;
    if (skill) {
      return skill.get('name') === '@workbench';
    }
    return false;
  }

  get isValidated() {
    return this.status === 'validé';
  }

  get skillName() {
    return this.skill.get('name');
  }

  get isDraft() {
    return this.status === 'proposé';
  }

  get isArchived() {
    return this.status === 'archivé';
  }

  get isObsolete() {
    return this.status === 'périmé';
  }

  get notDeclinable() {
    const declinable = this.declinable;
    return (declinable && declinable === 'non');
  }

  get statusCSS() {
    const status = this.status;
    switch (status) {
      case 'validé':
        return 'validated';
      case 'proposé':
        return 'suggested';
      case 'archivé':
        return 'archived';
      case 'périmé':
        return 'deleted';
      default:
        return '';
    }
  }

  get isLive() {
    return this.isDraft || this.isValidated;
  }

  get alternatives() {
    if (!this.isPrototype || this.isWorkbench) {
      return [];
    }
    const currentVersion = this.version;
    const skill = this.skill;
    if (skill) {
      return skill.get('alternatives').filter(alternative => {
        return (alternative.version === currentVersion);
      }).sort((a, b) => {
        return a.alternativeVersion - b.alternativeVersion;
      });
    } else {
      return [];
    }
  }

  get relatedPrototype() {
    if (this.isPrototype) {
      return null;
    }
    const currentVersion = this.version;
    const skill = this.skill;
    if (skill) {
      return skill.get('prototypes').find(prototype => (prototype.version === currentVersion));
    }
    return null;
  }

  get productionAlternatives() {
    return this.alternatives.filter(alternative => alternative.isValidated);
  }

  get archivedAlternatives() {
    return this.alternatives.filter(alternative => alternative.isArchived);
  }

  get draftAlternatives() {
    return this.alternatives.filter(alternative => alternative.isDraft);
  }

  get isTextBased() {
    const type = this.type;
    return ['QROC','QROCM','QROCM-ind','QROCM-dep'].includes(type);
  }

  get timerOn() {
    const timer = this.timer;
    return (timer && timer > 0) ? true : false;
  }

  set timerOn(value) {
    const timer = this.timer;
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

  get skillLevel() {
    return this.skill.get('level');
  }

  get attachmentBaseName() {
    if (this._definedBaseName) {
      return this._definedBaseName;
    }
    return this._firstAttachmentBaseName;
  }

  get _firstAttachmentBaseName() {
    const attachments = this.attachments;
    if (attachments && attachments.length > 0) {
      return attachments[0].filename.replace(/\.[^/.]+$/, '');
    }
    return null;
  }

  get primaryLocale() {
    return this.locales[0];
  }

  get otherLocalizedChallenges() {
    return this.localizedChallenges.filter((localizedChallenge) => localizedChallenge.locale !== this.primaryLocale);
  }

  set attachmentBaseName(value) {
    this._definedBaseName = value;
    return value;
  }

  archive() {
    this.status = 'archivé';
    this.archivedAt = new Date();
    return this.save();
  }

  obsolete() {
    this.status = 'périmé';
    this.madeObsoleteAt = new Date();
    return this.save();
  }

  validate() {
    this.status = 'validé';
    this.validatedAt = new Date();
    return this.save();
  }

  async duplicate() {
    const ignoredFields = ['skill', 'author', 'airtableId'];
    if (this.isPrototype) {
      ignoredFields.push('version');
    } else {
      ignoredFields.push('alternativeVersion');
    }
    const data = this._getJSON(ignoredFields);
    data.author = [this.config.author];

    data.status = 'proposé';
    data.skill = this.skill;
    data.id = this.idGenerator.newId('challenge');
    const newChallenge = this.myStore.createRecord(this.constructor.modelName, data);
    await this._cloneAttachments(newChallenge);
    return newChallenge;
  }

  async copyForDifferentSkill() {
    const ignoredFields = ['skill', 'airtableId'];
    const data = this._getJSON(ignoredFields);

    data.status = 'proposé';
    data.id = this.idGenerator.newId('challenge');
    const newChallenge = this.myStore.createRecord(this.constructor.modelName, data);
    await this._cloneAttachments(newChallenge);
    return newChallenge;
  }

  async derive() {
    const alternative = await this.duplicate();
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
    }, 0) + 1;
  }

  baseNameUpdated() {
    return this._firstAttachmentBaseName !== this.attachmentBaseName;
  }

  _getJSON(fieldsToRemove) {
    const data = this.toJSON({ idIncluded: false });
    if (data.illustration) {
      const illustration = data.illustration[0];
      data.illustration = [{ url:illustration.url, filename:illustration.filename }];
    }
    if (data.attachments) {
      data.attachments = data.attachments.map(value => {
        return { url:value.url, filename:value.filename };
      });
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

  async _cloneAttachments(newChallenge) {
    await this.files;
    this.files.map((attachment) => {
      const data = attachment.toJSON({ idIncluded: false });
      this.store.createRecord('attachment', { ...data, challenge: newChallenge, cloneBeforeSave: true });
    });
  }

}
