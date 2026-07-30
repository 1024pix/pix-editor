import { LocalizedChallenge } from './LocalizedChallenge.js';
import _ from 'lodash';

export class Challenge {
  #allFiles;
  #primaryLocales;
  #primaryStatus;
  #translations;
  #prototypePrimaryLocalizedChallenge;

  /** @type {LocalizedChallenge[]} */
  localizedChallenges;

  constructor({
    accessibility1,
    accessibility2,
    airtableId,
    alternativeVersion,
    archivedAt,
    author,
    autoReply,
    competenceId,
    createdAt,
    declinable,
    embedHeight,
    files,
    focusable,
    format,
    genealogy,
    id,
    isQualityOk,
    locales,
    localizedChallenges,
    madeObsoleteAt,
    pedagogy,
    responsive,
    shuffled,
    skillId,
    skills,
    spoil,
    status,
    t1Status,
    t2Status,
    t3Status,
    timer,
    translations,
    type,
    updatedAt,
    validatedAt,
    version,
    prototypeChallenge,
    prototypePrimaryLocalizedChallenge,
    assessmentMaintenanceTags,
    translationMaintenanceTags,
  } = {}) {
    this.accessibility1 = genealogy === Challenge.GENEALOGIES.PROTOTYPE || prototypeChallenge == null ? accessibility1 : prototypeChallenge.accessibility1;
    this.accessibility2 = genealogy === Challenge.GENEALOGIES.PROTOTYPE || prototypeChallenge == null ? accessibility2 : prototypeChallenge.accessibility2;
    this.airtableId = airtableId;
    this.alternativeVersion = alternativeVersion;
    this.archivedAt = archivedAt;
    this.author = author;
    this.autoReply = autoReply;
    this.competenceId = competenceId;
    this.createdAt = createdAt;
    this.declinable = declinable;
    this.embedHeight = embedHeight;
    this.focusable = focusable;
    this.format = format ?? Challenge.FORMATS.MOTS;
    this.genealogy = genealogy;
    this.id = id;
    this.isQualityOk = isQualityOk;
    this.madeObsoleteAt = madeObsoleteAt;
    this.pedagogy = pedagogy;
    this.responsive = responsive;
    this.shuffled = shuffled;
    this.skillId = skillId;
    this.skills = skills;
    this.spoil = spoil;
    this.t1Status = t1Status;
    this.t2Status = t2Status;
    this.t3Status = t3Status;
    this.timer = timer === 0 ? undefined : timer;
    this.type = type;
    this.updatedAt = updatedAt;
    this.validatedAt = validatedAt;
    this.version = version;
    this.assessmentMaintenanceTags = this.#setMaintenanceTags({ maintenanceTag: assessmentMaintenanceTags, key: 'assessmentMaintenanceTags', genealogy, prototypeChallenge });
    this.translationMaintenanceTags = this.#setMaintenanceTags({ maintenanceTag: translationMaintenanceTags, key: 'translationMaintenanceTags', genealogy, prototypeChallenge });

    this.localizedChallenges = localizedChallenges;

    this.#allFiles = files;
    this.#primaryLocales = Challenge.defaultLocales(locales);
    this.#primaryStatus = status;
    this.#translations = translations;
    this.#prototypePrimaryLocalizedChallenge = prototypePrimaryLocalizedChallenge;

    this.#translate(this.primaryLocale);
  }

  static get TRANSLATION_MAINTENANCE_TAGS() {
    return {
      NAME: 'Prénom ou nom propre dans la consigne/propositions/réponse/indice',
      EMBED_NAME: 'Prénom ou nom propre dans un embed ou dans du HTML intégré à l’épreuve',
      SIMPLE_FILE: 'Fichier simple à traduire',
      SIMPLE_ILLUSTRATION: 'Illustration simple à traduire',
      ZUCCHINI: 'Courgette dans un fichier',
      LOCALIZED_URL: 'URL avec équivalent dans une autre locale',
      FRENCH_SERVICE: 'Service numérique français',
      ILLUSTRATION_SCREENSHOT: 'Capture d\'écran dans une illustration',
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

  static get ASSESSMENT_MAINTENANCE_TAGS() {
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

  static get STATUSES() {
    return {
      VALIDE: 'validé',
      PROPOSE: 'proposé',
      ARCHIVE: 'archivé',
      PERIME: 'périmé',
    };
  }

  static get TYPES() {
    return {
      QCU: 'QCU',
      QCM: 'QCM',
      QROC: 'QROC',
      QROCM: 'QROCM',
      QROCM_IND: 'QROCM-ind',
      QROCM_DEP: 'QROCM-dep',
      QMAIL: 'QMAIL',
      NONE: '',
    };
  }

  static get PEDAGOGIES() {
    return {
      E_PREUVE: 'e-preuve',
      Q_SAVOIR: 'q-savoir',
      Q_SITUATION: 'q-situation',
      E_RECHINFO: 'e-rechinfo',
      E_SIMULATION: 'e-simulation',
    };
  }

  static get DECLINABLES() {
    return {
      FACILEMENT: 'facilement',
      DIFFICILEMENT: 'difficilement',
      NON: 'non',
      PERMUTATION: 'permutation',
      NONE: '',
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

  static get ACCESSIBILITY1() {
    return {
      RAS: 'RAS',
      OK: 'OK',
      ACQUIS_NON_PERTINENT: 'Acquis Non Pertinent',
      KO: 'KO',
      A_TESTER: 'A tester',
      NONE: '',
    };
  }

  static get ACCESSIBILITY2() {
    return {
      RAS: 'RAS',
      OK: 'OK',
      KO: 'KO',
      NONE: '',
    };
  }

  static get SPOILS() {
    return {
      NON_SPOILABLE: 'Non Sp',
      DIFFICILEMENT_SPOILABLE: 'Difficilement Sp',
      FACILEMENT_SPOILABLE: 'Facilement Sp',
      NONE: '',
    };
  }

  static get RESPONSIVES() {
    return {
      TABLETTE: 'Tablette',
      SMARTPHONE: 'Smartphone',
      TABLETTE_ET_SMARTPHONE: 'Tablette/Smartphone',
      NON: 'Non',
      NONE: '',
    };
  }

  static get FORMATS() {
    return {
      PETIT: 'petit',
      MOTS: 'mots',
      PHRASE: 'phrase',
      PARAGRAPHE: 'paragraphe',
      NOMBRE: 'nombre',
      DATE: 'date',
      NONE: '',
    };
  }

  static get ID_PREFIX() {
    return 'challenge';
  }

  static get PROTO_FIELDS() {
    return [
      'accessibility1',
      'accessibility2',
      'autoReply',
      'deafAndHardOfHearing',
      'declinable',
      'focusable',
      'hasEmbedInternalValidation',
      'isAwarenessChallenge',
      'isIncompatibleIpadCertif',
      'noValidationNeeded',
      'pedagogy',
      'requireGafamWebsiteAccess',
      'responsive',
      'shuffled',
      'spoil',
      'timer',
      'toRephrase',
      'type',
    ];
  }

  get isPropose() {
    return this.status === Challenge.STATUSES.PROPOSE;
  }

  get isValide() {
    return this.status === Challenge.STATUSES.VALIDE;
  }

  get isArchive() {
    return this.status === Challenge.STATUSES.ARCHIVE;
  }

  get isPerime() {
    return this.status === Challenge.STATUSES.PERIME;
  }

  get isPrototype() {
    return this.genealogy === Challenge.GENEALOGIES.PROTOTYPE;
  }

  get isAlternative() {
    return this.genealogy === Challenge.GENEALOGIES.DECLINAISON;
  }

  get primaryLocale() {
    return this.#primaryLocales[0];
  }

  get alternativeLocales() {
    return this.localizedChallenges.map(({ locale }) => locale).filter((locale) => locale !== this.primaryLocale);
  }

  get locale() {
    return this.locales[0];
  }

  get isPrimary() {
    return this.locale === this.primaryLocale;
  }

  get isDeclinable() {
    return this.declinable !== Challenge.DECLINABLES.NON;
  }

  get isMobileCompliant() {
    return [Challenge.RESPONSIVES.TABLETTE_ET_SMARTPHONE, Challenge.RESPONSIVES.SMARTPHONE].includes(this.responsive);
  }

  get isTabletCompliant() {
    return [Challenge.RESPONSIVES.TABLETTE_ET_SMARTPHONE, Challenge.RESPONSIVES.TABLETTE].includes(this.responsive);
  }

  get primaryLocalizedChallenge() {
    return this.localizedChallenges.find(({ locale }) => locale === this.primaryLocale);
  }

  get #primaryUrlsToConsult() {
    return this.primaryLocalizedChallenge.urlsToConsult;
  }

  get translations() {
    return this.#translations;
  }

  get dataOnSwitchGenealogy() {
    if (this.genealogy === Challenge.GENEALOGIES.PROTOTYPE) {
      return {
        id: this.id,
        genealogy: this.genealogy,
        alternativeVersion: this.alternativeVersion,
        accessibility1: this.accessibility1,
        accessibility2: this.accessibility2,
        updatedAt: new Date(),
      };
    }

    return {
      id: this.id,
      genealogy: this.genealogy,
      alternativeVersion: this.alternativeVersion,
      updatedAt: new Date(),
    };
  }

  static getPrimaryLocale(locales) {
    return Challenge.defaultLocales(locales)[0];
  }

  static defaultLocales(locales) {
    if (locales == undefined || locales.length === 0) return ['fr'];
    return [...locales].sort();
  }

  switchToPrototype({
    accessibility1,
    accessibility2,
    requireGafamWebsiteAccess,
    isIncompatibleIpadCertif,
    deafAndHardOfHearing,
    isAwarenessChallenge,
    toRephrase,
    hasEmbedInternalValidation,
    noValidationNeeded,
  }) {
    this.genealogy = Challenge.GENEALOGIES.PROTOTYPE;
    this.alternativeVersion = null;
    this.accessibility1 = accessibility1;
    this.accessibility2 = accessibility2;
    this.primaryLocalizedChallenge.switchToPrototype({
      requireGafamWebsiteAccess,
      isIncompatibleIpadCertif,
      deafAndHardOfHearing,
      isAwarenessChallenge,
      toRephrase,
      hasEmbedInternalValidation,
      noValidationNeeded,
    });
  }

  switchToAlternative({ alternativeVersion }) {
    this.genealogy = Challenge.GENEALOGIES.DECLINAISON;
    this.alternativeVersion = alternativeVersion;
  }

  cloneChallengeAndAttachments({
    competenceId,
    skillId,
    generateNewIdFnc,
    alternativeVersion,
    prototypeVersion,
    attachments,
  }) {
    const id = generateNewIdFnc(Challenge.ID_PREFIX);
    const { clonedLocalizedChallenge, clonedAttachments } = this.primaryLocalizedChallenge.clone({
      id,
      challengeId: id,
      status: LocalizedChallenge.STATUSES.PRIMARY,
      attachments,
    });
    const primaryTranslation = { [this.primaryLocale]: _.cloneDeep(this.translations[this.primaryLocale]) };

    const clonedChallenge = new Challenge({
      id,
      airtableId: null,
      translations: primaryTranslation,
      localizedChallenges: [clonedLocalizedChallenge],
      locales: this.locales,
      files: [],
      accessibility1: this.accessibility1,
      accessibility2: this.accessibility2,
      alternativeVersion,
      archivedAt: null,
      assessmentMaintenanceTags: this.assessmentMaintenanceTags,
      author: this.author,
      autoReply: this.autoReply,
      competenceId: competenceId,
      createdAt: null,
      declinable: this.declinable,
      embedHeight: this.embedHeight,
      focusable: this.focusable,
      format: this.format,
      genealogy: this.genealogy,
      geography: this.geography,
      madeObsoleteAt: null,
      pedagogy: this.pedagogy,
      responsive: this.responsive,
      shuffled: this.shuffled,
      skillId,
      skills: [],
      spoil: this.spoil,
      status: Challenge.STATUSES.PROPOSE,
      t1Status: this.t1Status,
      t2Status: this.t2Status,
      t3Status: this.t3Status,
      timer: this.timer,
      translationMaintenanceTags: this.translationMaintenanceTags,
      type: this.type,
      updatedAt: null,
      validatedAt: null,
      version: prototypeVersion,
    });

    return {
      clonedChallenge,
      clonedAttachments,
    };
  }

  translate(locale) {
    if (this.locale !== this.primaryLocale) {
      throw new Error('Illegal operation : trying to translate an already translated challenge');
    }
    const challenge = new Challenge({
      ...this,
      files: this.#allFiles,
      locales: this.#primaryLocales,
      status: this.#primaryStatus,
      translations: this.#translations,
      prototypePrimaryLocalizedChallenge: this.#prototypePrimaryLocalizedChallenge,
    });
    challenge.#translate(locale);
    return challenge;
  }

  #translate(locale) {
    this.locales = locale === this.primaryLocale ? this.#primaryLocales : [locale];
    this.instruction = this.#translations[this.locale]?.instruction ?? '';
    this.alternativeInstruction = this.#translations[this.locale]?.alternativeInstruction ?? '';
    this.proposals = this.#translations[this.locale]?.proposals ?? '';
    this.solution = this.#translations[this.locale]?.solution ?? '';
    this.solutionToDisplay = this.#translations[this.locale]?.solutionToDisplay ?? '';
    this.embedTitle = this.#translations[this.locale]?.embedTitle ?? '';
    this.illustrationAlt = this.#translations[this.locale]?.illustrationAlt ?? null;

    const localizedChallenge = findCorrespondingLocalizedChallenge(this.localizedChallenges, this.locale);

    this.id = localizedChallenge.id;
    this.status = this.#translateStatus(localizedChallenge);
    this.validatedAt = this.#translateValidatedAt(localizedChallenge);
    this.embedUrl = localizedChallenge.embedUrl ?? localizedChallenge.defaultEmbedUrl;
    this.geography = localizedChallenge.geography;
    this.urlsToConsult = this.#translateUrlsToConsult(localizedChallenge);
    if (this.#prototypePrimaryLocalizedChallenge == null) {
      this.requireGafamWebsiteAccess = this.primaryLocalizedChallenge.requireGafamWebsiteAccess;
      this.isIncompatibleIpadCertif = this.primaryLocalizedChallenge.isIncompatibleIpadCertif;
      this.deafAndHardOfHearing = this.primaryLocalizedChallenge.deafAndHardOfHearing;
      this.isAwarenessChallenge = this.primaryLocalizedChallenge.isAwarenessChallenge;
      this.toRephrase = this.primaryLocalizedChallenge.toRephrase;
      this.hasEmbedInternalValidation = this.primaryLocalizedChallenge.hasEmbedInternalValidation;
      this.noValidationNeeded = this.primaryLocalizedChallenge.noValidationNeeded;
    } else {
      this.requireGafamWebsiteAccess = this.#prototypePrimaryLocalizedChallenge.requireGafamWebsiteAccess;
      this.isIncompatibleIpadCertif = this.#prototypePrimaryLocalizedChallenge.isIncompatibleIpadCertif;
      this.deafAndHardOfHearing = this.#prototypePrimaryLocalizedChallenge.deafAndHardOfHearing;
      this.isAwarenessChallenge = this.#prototypePrimaryLocalizedChallenge.isAwarenessChallenge;
      this.toRephrase = this.#prototypePrimaryLocalizedChallenge.toRephrase;
      this.hasEmbedInternalValidation = this.#prototypePrimaryLocalizedChallenge.hasEmbedInternalValidation;
      this.noValidationNeeded = this.#prototypePrimaryLocalizedChallenge.noValidationNeeded;
    }

    this.files = this.#allFiles
      ?.filter(({ localizedChallengeId }) => localizedChallengeId === this.id)
      .map(({ fileId }) => fileId);
  }

  #translateStatus(localizedChallenge) {
    if (this.isPrimary) return this.#primaryStatus;
    if (
      [Challenge.STATUSES.PROPOSE, Challenge.STATUSES.PERIME].includes(this.status)
      || localizedChallenge.status === LocalizedChallenge.STATUSES.PLAY
    ) {
      return this.status;
    }
    return localizedChallenge.status;
  }

  #translateUrlsToConsult(localizedChallenge) {
    if (!this.#primaryUrlsToConsult) return null;
    return localizedChallenge.urlsToConsult;
  }

  #translateValidatedAt(localizedChallenge) {
    if (this.isPrimary) return this.validatedAt;
    return localizedChallenge.validatedAt;
  }

  #setMaintenanceTags({ maintenanceTag, genealogy, prototypeChallenge, key }) {
    const result = genealogy === Challenge.GENEALOGIES.PROTOTYPE || prototypeChallenge == null ? maintenanceTag : prototypeChallenge[key];
    return (result && result.length) ? result : null;
  }

  obsolete() {
    this.status = Challenge.STATUSES.PERIME;
    this.madeObsoleteAt = new Date();
  }
}

function findCorrespondingLocalizedChallenge(localizedChallenges, challengeLocale) {
  return localizedChallenges.find(({ locale }) => challengeLocale === locale);
}
