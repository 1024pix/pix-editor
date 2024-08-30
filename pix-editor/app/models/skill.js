import { inject as service } from '@ember/service';
import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { tracked } from '@glimmer/tracking';

export default class SkillModel extends Model {

  _pinnedRelationships = {};

  @attr('string', { readOnly: true }) name;
  @attr clue;
  @attr clueEn;
  @attr clueStatus;
  @attr({ readOnly: true }) createdAt;
  @attr description;
  @attr descriptionStatus;
  @attr level;
  @attr status;
  @attr pixId;
  @attr i18n;
  @attr('number') version;

  @belongsTo('tube')
    tube;

  @hasMany('challenge', { readOnly: true })
    challenges;

  @hasMany('tutorial')
    tutoSolution;

  @hasMany('tutorial')
    tutoMore;

  @service('store') myStore;

  @tracked _selected = false;

  get date() {
    const createdDate = this.createdAt;
    return (new Date(createdDate)).toLocaleDateString('fr', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  get clueCSS() {
    const status = this.clueStatus;
    if (!status) {
      return 'suggested';
    } else {
      return this._getCSSFromClueStatus(status);
    }
  }

  get statusCSS() {
    const status = this.status;
    switch (status) {
      case 'en construction':
        return 'suggested';
      case 'actif':
        return 'validated';
      case 'archivé':
        return 'archived';
      case 'périmé':
        return 'deleted';
      default:
        return '';
    }
  }

  get clueNA() {
    return (this.clueStatus === 'inapplicable');
  }

  get prototypes() {
    return this.challenges.filter((challenge) => challenge.isPrototype);
  }

  get sortedPrototypes() {
    return this.prototypes.sort((a, b) => a.version < b.version);
  }

  get productionPrototype() {
    return this.prototypes.find((prototype) => prototype.isValidated);
  }

  get productionPrototypes() {
    return this.prototypes.filter((prototype) => prototype.isValidated);
  }

  get alternatives() {
    return this.challenges.filter((challenge) => !challenge.isPrototype);
  }

  get validatedChallenges() {
    return this.challenges.filter((challenge) => challenge.isValidated);
  }

  get liveChallenges() {
    return this.challenges.filter((challenge) => challenge.isLive);
  }

  get isActive() {
    return this.status === 'actif';
  }

  get isArchived() {
    return this.status === 'archivé';
  }

  get isDraft() {
    return this.status === 'en construction';
  }

  get isLive() {
    return this.status === 'actif' || this.status === 'en construction';
  }

  get isObsolete() {
    return this.status === 'périmé';
  }

  get languagesAndAlternativesCount() {
    const languagesAndAlternativesCount = this.validatedChallenges.reduce((acc, challenge) => {
      return this._extractLanguagesAndAlternativesCountFromChallenges(acc, challenge.locales);
    }, new Map());
    return new Map([...languagesAndAlternativesCount.entries()].sort());
  }

  get languages() {
    const skillLanguagesMap = this.languagesAndAlternativesCount;
    if (skillLanguagesMap) {
      return [...skillLanguagesMap.keys()];
    }
    return [];
  }

  getNextPrototypeVersion() {
    return this.prototypes.reduce((current, prototype) => {
      const version = prototype.version;
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

  archive() {
    this.status = 'archivé';
    return this.save();
  }

  obsolete() {
    this.status = 'périmé';
    return this.save();
  }

  async pinRelationships() {
    const tutorials = await Promise.all([this.tutoSolution, this.tutoMore]);
    this._pinnedRelationships = {
      tutoSolution: tutorials[0].toArray(),
      tutoMore: tutorials[1].toArray(),
    };
  }

  rollbackAttributes() {
    super.rollbackAttributes(...arguments);
    const tutoSolution = this._pinnedRelationships.tutoSolution;
    this.tutoSolution = tutoSolution;
    const tutoMore = this._pinnedRelationships.tutoMore;
    this.tutoMore = tutoMore;
  }

  async save(...args) {
    const result = await super.save(...args);
    await this.pinRelationships();
    return result;
  }

  async clone({ tubeDestination, level }) {
    const newSkill = this.myStore.createRecord(this.constructor.modelName, {});

    return newSkill.save({ adapterOptions: {
      clone: true,
      skillIdToClone: this.pixId,
      tubeDestinationId: tubeDestination.pixId,
      level,
    } });
  }

  _getJSON(fieldsToRemove) {
    const data = this.toJSON({ idIncluded: false });
    fieldsToRemove.forEach((current) => {
      if (data[current]) {
        delete data[current];
      }
    });
    return data;
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

  _extractLanguagesAndAlternativesCountFromChallenges(extractedLanguages, challengeLanguages) {
    if (challengeLanguages) {
      challengeLanguages.forEach((language) => {
        if (!extractedLanguages.has(language)) {
          extractedLanguages.set(language, 1);
        } else {
          extractedLanguages.set(language, extractedLanguages.get(language) + 1);
        }
      });
    }
    return extractedLanguages;
  }

}

