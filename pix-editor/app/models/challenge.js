import { service } from '@ember/service';
import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { tracked } from '@glimmer/tracking';
import _ from 'lodash';

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
  @attr({ readOnly: true }) preview;
  @attr('number') timer;
  @attr embedURL;
  @attr embedTitle;
  @attr('number') embedHeight;
  @attr('number') alternativeVersion;
  @attr accessibility1;
  @attr accessibility2;
  @attr spoil;
  @attr responsive;
  @attr isQualityOk;
  @attr({
    defaultValue: function () {
      return [];
    },
  })
  assessmentMaintenanceTags;
  @attr({
    defaultValue: function () {
      return [];
    },
  })
  translationMaintenanceTags;
  @attr({
    defaultValue: function () {
      return [];
    },
  })
  locales;

  @attr alternativeLocales;
  @attr geography;
  @attr urlsToConsult;
  @attr autoReply;
  @attr focusable;
  @attr illustrationAlt;
  @attr('date') updatedAt;
  @attr('date') validatedAt;
  @attr('date') archivedAt;
  @attr('date') madeObsoleteAt;
  @attr('boolean') shuffled;
  @attr requireGafamWebsiteAccess;
  @attr isIncompatibleIpadCertif;
  @attr deafAndHardOfHearing;
  @attr isAwarenessChallenge;
  @attr toRephrase;
  @attr('boolean') hasEmbedInternalValidation;
  @attr('boolean') noValidationNeeded;

  @belongsTo('skill', { inverse: 'challenges', async: true }) skill;
  @hasMany('attachment', { inverse: 'challenge', async: true }) attachments;
  @hasMany('note', { inverse: null, async: true }) notes;
  @hasMany('changelog-entry', { inverse: null, async: true }) changelogEntries;
  @hasMany('localized-challenge', { inverse: 'challenge', async: true }) localizedChallenges;
  @hasMany('challenge-locale', { inverse: 'challenge', async: false }) challengeLocales;

  @service('store') myStore;
  @service config;

  @tracked _definedBaseName;

  static get STATUSES() {
    return {
      VALIDE_QUALITE: 'validé qualité',
      VALIDE: 'validé',
      PROPOSE: 'proposé',
      ARCHIVE: 'archivé',
      PERIME: 'périmé',
    };
  }

  static get ASSESSMENT_MAINTENANCE_TAGS() {
    return {
      NAME: 'Prénom ou nom propre dans la consigne/propositions/réponse/indice',
      EMBED_NAME: 'Prénom ou nom propre dans un embed ou dans du HTML intégré à l’épreuve',
      SIMPLE_FILE: 'Fichier simple à traduire',
      SIMPLE_ILLUSTRATION: 'Illustration simple à traduire',
      ZUCCHINI: 'Courgette dans un fichier',
      LOCALIZED_URL: 'URL avec équivalent dans une autre locale',
      FRENCH_SERVICE: 'Service numérique français',
      ILLUSTRATION_SCREENSHOT: "Capture d'écran dans une illustration",
      STYLE_ADAPTATION: 'Adaptation de style de fichier dans la langue ciblé',
      HEAVY_ILLUSTRATION: 'Illustration lourde à retravailler',
      LITERARY_WORK: 'Œuvre littéraire',
      FILE_TO_REDO: 'Fichier à refaire entièrement',
      SPECIFIC_WEBSITE: 'Site ou page web spécifique',
      HARD_CONTEXTUALIZATION_EMBED: 'Embed difficile à contextualiser',
      ENGLISH_WORD: 'Anglicismes à reformuler',
      WEBSITE_TO_REDO: 'Site web ou blog à refaire entièrement',
      EMBED_TO_REDO: 'Embed non traduisible à refaire entièrement',
      MISC: 'Éléments sans équivalents',
    };
  }

  static get TRANSLATION_MAINTENANCE_TAGS() {
    return {
      RULE: 'Règle, législation ou connaissance',
      INTERFACE: 'Charte graphique ou interface',
      SOFTWARE_EVOLUTION: 'Évolution logicielle',
      FIRSTNAMES: 'Noms propres',
      EXTERNAL_LINKS: 'Liens externes',
      SPOILABLE_INFO: 'E-rechinfo spoilable',
      TOOL_QUESTION: 'Question outil',
      AMBIGUOUS_ANSWERS: 'Réponses ambiguës',
      KNOWN_EXPIRY_DATE: 'Date de péremption connue',
      NO_DECLI_INSTRUCTION: 'Pas de mode d’emploi des déclinaisons ou pas d’antisèche',
    };
  }

  static get GENEALOGIES() {
    return {
      PROTOTYPE: 'Prototype 1',
      DECLINAISON: 'Décliné 1',
      UNUSED_DECLINE: 'décliné',
      UNUSED_ENG: 'ENG',
      UNUSED_ECRI: 'ECRI',
      UNUSED_FRANCOPHONE: 'FRANCOPHONE',
      NONE: '',
    };
  }

  get illustration() {
    const attachments = this.hasMany('attachments').value() ?? [];
    return attachments.find((attachment) => attachment.type === 'illustration' && !attachment.isDeleted);
  }

  get piecesJointes() {
    const attachments = this.hasMany('attachments').value() ?? [];
    return attachments.filter((attachment) => attachment.type === 'attachment' && !attachment.isDeleted);
  }

  get isPrototype() {
    return this.genealogy === ChallengeModel.GENEALOGIES.PROTOTYPE;
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

  get computedStatus() {
    if (this.isQualityOk && this.isValidated) {
      return 'validé qualité';
    }
    return this.status;
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
      return skill
        .get('alternatives')
        .filter((alternative) => {
          return alternative.version === currentVersion;
        })
        .sort((a, b) => {
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
      return skill.get('prototypes').find((prototype) => prototype.version === currentVersion);
    }
    return null;
  }

  get productionAlternatives() {
    return this.alternatives.filter((alternative) => alternative.isValidated);
  }

  get archivedAlternatives() {
    return this.alternatives.filter((alternative) => alternative.isArchived);
  }

  get draftAlternatives() {
    return this.alternatives.filter((alternative) => alternative.isDraft);
  }

  get isTextBased() {
    const type = this.type;
    return ['QROC', 'QROCM', 'QROCM-ind', 'QROCM-dep'].includes(type);
  }

  get timerOn() {
    const timer = this.timer;
    return timer && timer > 0 ? true : false;
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

  set attachmentBaseName(value) {
    this._definedBaseName = value;
    return value;
  }

  get _firstAttachmentBaseName() {
    const piecesJointes = this.piecesJointes;
    if (piecesJointes && piecesJointes.length > 0) {
      return piecesJointes[0].filename.replace(/\.[^/.]+$/, '');
    }
    return null;
  }

  get primaryLocale() {
    return this.locales[0];
  }

  get otherLocalizedChallenges() {
    const localizedChallenges = this.hasMany('localizedChallenges').value() ?? [];
    return localizedChallenges.filter((localizedChallenge) => localizedChallenge.locale !== this.primaryLocale);
  }

  get previewUrl() {
    return new URL(this.preview, window.location).href;
  }

  async getChallengeForLocale(locale) {
    const canonicalLocale = Intl.getCanonicalLocales(locale).toString();

    const challengeLocale = this.challengeLocales.find((challengeLocale) => {
      return challengeLocale.locale === canonicalLocale;
    });
    await challengeLocale.belongsTo('localizedChallenge').reload();
    return challengeLocale;
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
    const ignoredFields = [
      'skill',
      'author',
      'airtableId',
      'updatedAt',
      'archivedAt',
      'madeObsoleteAt',
      'validatedAt',
      'isQualityOk',
    ];
    if (this.isPrototype) {
      ignoredFields.push('version');
    } else {
      ignoredFields.push('alternativeVersion');
    }
    const data = this._getJSON(ignoredFields);
    data.author = [this.config.author];
    data.status = 'proposé';
    data.skill = await this.skill;

    const newChallenge = this.myStore.createRecord(this.constructor.modelName, data);
    await this._cloneAttachments(newChallenge);
    return newChallenge;
  }

  async copyForDifferentSkill() {
    const ignoredFields = [
      'skill',
      'airtableId',
      'updatedAt',
      'archivedAt',
      'madeObsoleteAt',
      'validatedAt',
      'isQualityOk',
    ];
    const data = this._getJSON(ignoredFields);
    data.status = 'proposé';

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
    const currentVersions = this.alternatives
      .map((alternative) => parseInt(alternative.alternativeVersion))
      .filter(Number.isInteger);
    return Math.max(...currentVersions, 0) + 1;
  }

  baseNameUpdated() {
    return this._firstAttachmentBaseName !== this.attachmentBaseName;
  }

  _getJSON(fieldsToRemove) {
    const data = this._toJSON(this);

    delete data['airtable-id'];
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
    const attachments = (await this.attachments)?.slice() ?? [];
    attachments.map((attachment) => {
      const data = this._attachmentToJSON(attachment);
      this.store.createRecord('attachment', { ...data, challenge: newChallenge, cloneBeforeSave: true });
    });
  }

  _toJSON() {
    const rawSerializedData = structuredClone(this.serialize({ idIncluded: false }));
    const data = {};
    for (const [key, value] of Object.entries(rawSerializedData.data.attributes)) {
      const newKey = key === 'embed-url' ? 'embedURL' : _.camelCase(key);
      data[newKey] = value;
    }
    return data;
  }

  _attachmentToJSON(attachment) {
    const rawSerializedData = structuredClone(attachment.serialize({ idIncluded: false }));
    const data = {};
    for (const [key, value] of Object.entries(rawSerializedData.data.attributes)) {
      const newKey = _.camelCase(key);
      data[newKey] = value;
    }
    return data;
  }
}
