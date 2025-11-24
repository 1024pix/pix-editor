import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import * as Sentry from '@sentry/ember';
import yaml from 'js-yaml';

export default class SingleController extends Controller {
  wasMaximized = false;
  changelogCallback = null;
  elementClass = 'prototype-challenge';
  @tracked edition = false;
  @tracked displayAlternativeInstructionsField = false;
  @tracked displaySolutionToDisplayField = false;
  @tracked displayUrlsToConsultField = false;
  @tracked creation = false;
  @tracked popinImageSrc = '';
  @tracked displayImage = false;
  @tracked displaySelectLocation = false;
  @tracked displayChallengeLog = false;
  @tracked displayChangeLog = false;
  @tracked changelogDefault = '';
  @tracked displayConfirmLog = false;
  @tracked isStatusActionMenuOpen = false;
  @service access;
  @service changelogEntry;
  @service config;
  @service confirm;
  @service currentData;
  @service filePath;
  @service intl;
  @service loader;
  @service notify;
  @service router;
  @service storage;
  @service store;
  @service countries;

  @tracked invalidUrlsToConsult = '';
  @tracked invalidEmbedURL = '';
  @tracked urlsToConsult = '';

  deletedFiles = [];

  @controller('authenticated.competence') parentController;
  @controller('authenticated.competence.prototypes') overviewController;

  get challengeStatusActionsId() {
    return `challenge-${this.challenge.id}-status-actions`;
  }

  get challengeStatusActionsLabel() {
    if (!this.challenge.isPrototype) {
      return 'Modifier le statut de la déclinaison';
    }
    return 'Modifier le statut de l\'épreuve';
  }

  get maximized() {
    return this.parentController.leftMaximized;
  }

  get challenge() {
    return this.model;
  }

  get countryList() {
    return this.countries.list.map((country) => ({
      label: country.name,
      value: country.code,
    }));
  }

  get challengeTitle() {
    if (this.creation) {
      return 'Nouveau prototype';
    } else if (this.challenge.isWorkbench) {
      return '';
    } else {
      return this.challenge.skillName;
    }
  }

  get mayEdit() {
    return this.access.mayEdit(this.challenge);
  }

  get mayDuplicate() {
    return this.access.mayDuplicate(this.challenge);
  }

  get mayAccessLog() {
    return this.access.mayAccessLog(this.challenge);
  }

  get mayValidate() {
    return this.access.mayValidate(this.challenge);
  }

  get mayArchive() {
    return this.access.mayArchive(this.challenge);
  }

  get mayObsolete() {
    return this.access.mayObsolete(this.challenge);
  }

  get mayMove() {
    return this.access.mayMove(this.challenge);
  }

  get mayAccessAlternatives() {
    return this.challenge.isPrototype && !this.challenge.isWorkbench;
  }

  get level() {
    const challenge = this.challenge;
    if (challenge.skillLevel) {
      return challenge.skillLevel;
    } else {
      return false;
    }
  }

  get lastUpdatedAtISO() {
    return this.challenge.updatedAt.toISOString();
  }

  get absolutePreviewUrl() {
    return new URL(this.challenge.preview, window.location).href;
  }

  get localizedChallengeLinkRoute() {
    return this.challenge.get('isPrototype') ? 'authenticated.competence.prototypes.localized' : 'authenticated.competence.prototypes.single.alternatives.localized';
  }

  get defaultSaveChangelog() {
    return this.intl.t('prototype.changelog.update-message');
  }

  @action
  getLocalizedChallengeLinkModels(localizedChallenge) {
    return [this.challenge.get('id'), localizedChallenge.get('id')];
  }

  @action
  setDisplayAlternativeInstructionsField(boolean) {
    this.displayAlternativeInstructionsField = boolean;
    if (!boolean) {
      this.challenge.alternativeInstruction = '';
    }
  }

  @action
  setDisplaySolutionToDisplayField(boolean) {
    this.displaySolutionToDisplayField = boolean;
    if (!boolean) {
      this.challenge.solutionToDisplay = '';
    }
  }

  @action
  setDisplayUrlsToConsultField(boolean) {
    this.displayUrlsToConsultField = boolean;
    if (!boolean) {
      this.challenge.urlsToConsult = null;
      this.urlsToConsult = '';
      this.invalidUrlsToConsult = '';
    }
  }

  @action
  showIllustration() {
    const illustration = this.challenge.illustration;
    this.popinImageSrc = illustration.url;
    this.displayImage = true;
  }

  @action
  closeIllustration() {
    this.displayImage = false;
  }

  @action
  maximize() {
    this.parentController.maximizeLeft(true);
  }

  @action
  minimize() {
    this.parentController.maximizeLeft(false);
  }

  @action
  close() {
    this.parentController.send('closeChildComponent');
  }

  @action
  edit() {
    this.wasMaximized = this.maximized;
    this.maximize();
    this.edition = true;
  }

  @action
  async cancelEdit() {
    this.edition = false;
    this.displayAlternativeInstructionsField = false;
    this.displaySolutionToDisplayField = false;
    this.displayUrlsToConsultField = false;
    this.challenge.rollbackAttributes();
    await this.challenge.attachments;
    this.challenge.attachments.forEach((attachment) => attachment.rollbackAttributes());
    this.urlsToConsult = this.challenge.urlsToConsult?.join('\n') ?? '';
    this.invalidUrlsToConsult = '';
    this.invalidEmbedURL = '';
    this.deletedFiles = [];
    if (!this.wasMaximized) {
      this.minimize();
    }
    this._message(this.intl.t('common.modify.cancel'));
  }

  @action
  save() {
    if (!this._saveCheck(this.challenge)) {
      return;
    }
    this.displayConfirmLog = true;
  }

  @action
  async saveChallengeCallback(changelog) {
    this.closeComfirmLogPopin();
    this.loader.start();

    return Promise.resolve(this.challenge)
      .then((challenge) => this._handleIllustration(challenge))
      .then((challenge) => this._handlePiecesJointes(challenge))
      .then((challenge) => this._saveFiles(challenge))
      .then((challenge) => this._saveChallenge(challenge))
      .then((challenge) => this._handleChangelog(challenge, changelog))
      .then(() => {
        this.edition = false;
        this.displayAlternativeInstructionsField = false;
        this.displaySolutionToDisplayField = false;
        this.displayUrlsToConsultField = false;
        this.invalidUrlsToConsult = '';
        if (!this.wasMaximized) {
          this.minimize();
        }
        this._message(this.intl.t('prototype.changelog.update-status'));
      })
      .catch((error) => {
        console.error(error);
        Sentry.captureException(error);
        this._errorMessage(this.intl.t('prototype.changelog.update-error'));
      })
      .finally(() => {
        this.loader.stop();
      });
  }

  @action
  duplicate() {
    this.parentController.send('copyChallenge', this.challenge);
  }

  @action
  showAlternatives() {
    this.router.transitionTo('authenticated.competence.prototypes.single.alternatives', this.currentData.getCompetence(), this.challenge);
  }

  @action
  async validate() {
    this.isStatusActionMenuOpen = false;
    try {
      await this.confirm.ask('Mise en production', 'Êtes-vous sûr de vouloir mettre l\'épreuve en production ?');
      const defaultLogMessage = this.challenge.isPrototype ? 'Mise en production du prototype' : 'Mise en production de la déclinaison';
      this._displayChangelogPopIn(defaultLogMessage, async (changelog) => {
        try {
          this.loader.start();
          const challenge = await this._validationChecks(this.challenge);
          await this._archivePreviousPrototype(challenge);
          await this._archiveOtherActiveSkillVersion(challenge);
          await challenge.validate();
          await this._handleChangelog(challenge, changelog);
          await this._checkSkillValidation(challenge);
          await this._validateAlternatives(challenge);
          const skill = await challenge.skill;
          await skill.hasMany('challengesProduction').reload();
          this._message('Mise en production réussie');
          this.parentController.send('selectView', 'production', true);
          this.router.refresh('authenticated.competence.prototypes');
        } catch (error) {
          console.error(error);
          Sentry.captureException(error);
          this._errorMessage('Erreur lors de la mise en production');
        } finally {
          this.loader.stop();
        }
      });
    } catch {
      this._message('Mise en production abandonnée');
    }
  }

  @action
  async archive() {
    this.isStatusActionMenuOpen = false;
    try {
      await this.confirm.ask('Archivage', 'Êtes-vous sûr de vouloir archiver l\'épreuve ?');
      this._displayChangelogPopIn('Archivage de l\'épreuve', async (changelog) => {
        try {
          this.loader.start();
          await this._archiveAlternatives(this.challenge);
          await this._handleChangelog(this.challenge, changelog);
          await this._archiveOrDeactivateSkill(this.challenge);
          await this.challenge.archive();
          this._message('Épreuve archivée');
          this.send('close');
          this.router.refresh('authenticated.competence.prototypes');
        } catch (error) {
          console.error(error);
          Sentry.captureException(error);
          this._errorMessage('Erreur lors de l\'archivage');
        } finally {
          this.loader.stop();
        }
      });
    } catch (error) {
      Sentry.captureException(error);
      this._message('Archivage abandonné');
    }
  }

  @action
  async obsolete() {
    this.isStatusActionMenuOpen = false;
    try {
      await this.confirm.ask(this.intl.t('challenge.obsolete.confirm.title'), this.intl.t('challenge.obsolete.confirm.message'));
      this._displayChangelogPopIn(this.intl.t('challenge.obsolete.changelog'), async (changelog) => {
        try {
          this.loader.start();
          await this._obsoleteAlternatives(this.challenge);
          await this._handleChangelog(this.challenge, changelog);
          await this._obsoleteArchiveOrDeactivateSkill(this.challenge);
          await this.challenge.obsolete();
          this._message(this.intl.t('challenge.obsolete.success'));
          this.send('close');
          this.router.refresh('authenticated.competence.prototypes');
        } catch (error) {
          Sentry.captureException(error);
          this._errorMessage(this.intl.t('challenge.obsolete.error'));
        } finally {
          this.loader.stop();
        }
      });
    } catch (error) {
      Sentry.captureException(error);
      this._message(this.intl.t('challenge.obsolete.cancel'));
    }
  }

  @action
  challengeLog() {
    this.displayChallengeLog = true;
  }

  @action
  closeChallengeLog() {
    this.displayChallengeLog = false;
  }

  @action
  async showVersions() {
    const skill = await this.challenge.skill;
    const tube = await skill.get('tube');
    this.router.transitionTo('authenticated.competence.prototypes.list', tube.id, skill.id);
  }

  @action
  changelogApprove(value) {
    if (this.changelogCallback) {
      this.changelogCallback(value);
    }
    this.displayChangeLog = false;
  }

  @action
  movePrototype() {
    this.displaySelectLocation = true;
  }

  @action
  closeMovePrototype() {
    this.displaySelectLocation = false;
  }

  @action
  setSkill(skill) {
    if (!skill) {
      this._errorMessage(this.intl.t('challenge.move.error-no-skill'));
      return;
    }
    this._displayChangelogPopIn(this.intl.t('challenge.move.message'), async (changelog) => {
      this.loader.start();
      try {
        const prototype = this.challenge;
        await this._setSkill(prototype, skill);
        await this._handleChangelog(prototype, changelog);
        await this.overviewController.send('refreshModel');
      } catch (error) {
        Sentry.captureException(error);
        this._message(this.intl.t('challenge.move.error'));
      } finally {
        this.loader.stop();
      }
    });
  }

  @action
  closeComfirmLogPopin() {
    this.displayConfirmLog = false;
  }

  async _setSkill(prototype, skill) {
    const prototypeVersion = skill.getNextPrototypeVersion();
    const challenges = prototype.alternatives;
    challenges.push(prototype);
    await Promise.all(challenges.map(async(challenge) => {
      challenge.skill = skill;
      challenge.version = prototypeVersion;
      await challenge.save();
      if (challenge.isPrototype) {
        this._message(this.intl.t('challenge.move.success-prototype-message'));
      } else {
        this._message(this.intl.t('challenge.move.success-alternative-message', { number: challenge.alternativeVersion }));
      }
    }));
  }

  @action
  async removeIllustration() {
    await this.challenge.attachments;
    const removedFile = this.challenge.illustration;
    if (removedFile) {
      removedFile.deleteRecord();
      if (removedFile.id) {
        this.deletedFiles.push(removedFile);
      }
    }
  }

  @action
  async removeAttachment(removedAttachment) {
    await this.challenge.attachments;
    const removedFile = this.challenge.piecesJointes?.find((pieceJointe) => pieceJointe.filename === removedAttachment.filename);
    if (removedFile) {
      removedFile.deleteRecord();
      if (removedFile.id) {
        this.deletedFiles.push(removedFile);
      }
    }
  }

  @action
  setUrlsToConsult(value) {
    const invalidUrls = [];
    let values = value.split('\n').map((s) => s.trim());
    values = values.filter((value) => {
      try {
        new URL(value);
        return true;
      } catch {
        invalidUrls.push(value);
        return false;
      }
    });
    this.invalidUrlsToConsult = invalidUrls.join(', ');
    this.challenge.urlsToConsult = values;
    this.urlsToConsult = this.challenge.urlsToConsult?.join('\n') ?? '';
  }

  _saveCheck(challenge) {
    if (challenge.autoReply && !challenge.embedURL) {
      this._errorMessage('Le mode "Réponse automatique" à été activé alors que l\'épreuve ne contient pas d\'embed');
      return false;
    }
    if (['QROCM-ind', 'QROCM-dep'].includes(challenge.type) && !this._validateYAML(challenge.solution)) {
      this._errorMessage('Le champ "Réponses" n\'est pas correctement formaté');
      return false;
    }

    return true;
  }

  _validateYAML(content) {
    try {
      yaml.load(content);
      return true;
    } catch {
      return false;
    }
  }

  _validationChecks(challenge) {
    this._loadingMessage('Vérifications');
    if (challenge.isValidated) {
      return this._error('L\'épreuve est déjà en production');
    }
    if (challenge.isPrototype) {
      if (challenge.skill == null) {
        return this._error('L\'épreuve n\'est pas rattachée à un acquis');
      }
      return Promise.resolve(challenge);
    } else {
      const prototype = challenge.relatedPrototype;
      if (!prototype.isValidated) {
        return this._error('Le prototype correspondant n\'est pas validé');
      }
      return Promise.resolve(challenge);
    }
  }

  async _archivePreviousPrototype(challenge) {
    const skill = await challenge.skill;
    const productionPrototype = skill.productionPrototype;
    if (!challenge.isPrototype || productionPrototype == null) {
      return;
    }
    await this.confirm.ask('Archivage du prototype précédent', 'Êtes-vous sûr de vouloir archiver le prototype précédent et ses déclinaisons ?');
    await productionPrototype.archive();
    await this._archiveAlternatives(productionPrototype);
  }

  async _validateAlternatives(challenge) {
    if (!challenge.isPrototype || challenge.draftAlternatives.length === 0) {
      return;
    }
    const alternatives = challenge.draftAlternatives;
    try {
      await this.confirm.ask('Mise en production des déclinaisons', 'Souhaitez-vous mettre en production les déclinaisons proposées ?');
      const alternativesPublication = alternatives.map(async (alternative) => {
        const validatedAlternative = await alternative.validate();
        this._message(`Alternative n°${validatedAlternative.alternativeVersion} mise en production`);
      });
      return Promise.all(alternativesPublication);
    } catch (e) {
      console.error(e);
      this._message('Mise en production des déclinaisons annulée');
    }
  }

  _archiveAlternatives(challenge) {
    if (!challenge.isPrototype) {
      return Promise.resolve(challenge);
    }
    const toArchive = challenge.productionAlternatives;
    const toObsolete = challenge.draftAlternatives;
    if (toArchive.length === 0 && toObsolete.length === 0) {
      return Promise.resolve(challenge);
    }
    const alternativesArchive = toArchive.map((alternative) => {
      return alternative.archive()
        .then((alternative) => this._message(this.intl.t('challenge.alternative.archive', { number: alternative.alternativeVersion })));
    });
    const alternativesObsolete = toObsolete.map((alternative) => {
      return alternative.obsolete()
        .then((alternative) => this._message(this.intl.t('challenge.alternative.obsolete', { number: alternative.alternativeVersion })));
    });
    const alternativesArchiveAndObsolete = [...alternativesArchive, ...alternativesObsolete];
    return Promise.all(alternativesArchiveAndObsolete)
      .then(() => challenge);
  }

  _obsoleteAlternatives(challenge) {
    if (!challenge.isPrototype) {
      return Promise.resolve(challenge);
    }
    const toObsolete = challenge.alternatives.filter((alternative) => !alternative.isObsolete);
    if (toObsolete.length === 0) {
      return Promise.resolve(challenge);
    }
    const alternativesObsolete = toObsolete.map((alternative) => {
      return alternative.obsolete()
        .then((alternative) => this._message(this.intl.t('challenge.alternative.obsolete', { number: alternative.alternativeVersion })));
    });
    return Promise.all(alternativesObsolete)
      .then(() => challenge);
  }

  async _archiveOtherActiveSkillVersion(challenge) {
    const currentSkill = await challenge.skill;
    if (!challenge.isPrototype || currentSkill.isActive) {
      return;
    }
    const tube = await currentSkill.tube;
    const skillVersions = tube.filledLiveSkills[currentSkill.level - 1];
    const activeSkill = skillVersions ? skillVersions.find((skill) => skill.isActive) : false;
    if (!activeSkill) {
      return;
    }
    await this.confirm.ask('Archivage de la version précédente de l\'acquis', `La mise en production de ce prototype va remplacer l'acquis précédent (${activeSkill.pixId}) par le nouvel acquis (${currentSkill.pixId}). Êtes-vous sûr de vouloir archiver l'acquis ${activeSkill.pixId} et les épreuves correspondantes ?`);
    await activeSkill.archive();
    const challengesToArchiveOrObsolete = activeSkill.liveChallenges.map((liveChallenge) => {
      if (liveChallenge.isValidated) {
        return liveChallenge.archive();
      }
      if (liveChallenge.isDraft) {
        return liveChallenge.obsolete();
      }
    });
    await Promise.all(challengesToArchiveOrObsolete);
  }

  async _checkSkillValidation(challenge) {
    const skill = await challenge.skill;
    await Promise.all([skill.tutoMore, skill.tutoSolution]);
    if (challenge.isPrototype && !skill.isActive) {
      await skill.activate();
      this._message(`Activation de l'acquis ${skill.name}`);
    }
  }

  async _archiveOrDeactivateSkill(challenge) {
    const skill = await challenge.skill;
    if (!this._isProductionPrototype(challenge)) {
      return;
    }
    await Promise.all([skill.tutoMore, skill.tutoSolution]);
    const prototypesStatusOtherVersion = this._getPrototypesStatusOtherVersion(skill, challenge);
    const haveProposalPrototype = prototypesStatusOtherVersion.includes('proposé');
    if (haveProposalPrototype) {
      return skill.deactivate();
    }
    return skill.archive();
  }

  async _obsoleteArchiveOrDeactivateSkill(challenge) {
    const skill = await challenge.skill;
    if (!this._isProductionPrototype(challenge)) {
      return;
    }
    await Promise.all([skill.tutoMore, skill.tutoSolution]);
    const prototypesStatusOtherVersion = this._getPrototypesStatusOtherVersion(skill, challenge);
    if (prototypesStatusOtherVersion.includes('proposé')) {
      return skill.deactivate();
    }
    if (prototypesStatusOtherVersion.includes('archivé')) {
      return skill.archive();
    }
    return skill.obsolete();
  }

  _isProductionPrototype(challenge) {
    const skill = challenge.skill;
    return skill.get('productionPrototype')?.id === challenge.id;
  }

  _getPrototypesStatusOtherVersion(skill, challenge) {
    return skill.prototypes
      .filter((prototype) => prototype.id !== challenge.id)
      .map((prototype) => prototype.status);
  }

  async _handleIllustration(challenge) {
    const illustration = await challenge.illustration;
    if (illustration && illustration.isNew && !illustration.cloneBeforeSave) {
      this._loadingMessage('Envoi de l\'illustration...');
      const newIllustration = await this.storage.uploadFile({ file: illustration.file });
      challenge.illustration.url = newIllustration.url;
    }
    return challenge;
  }

  async _handlePiecesJointes(challenge) {
    const piecesJointes = await challenge.piecesJointes;
    if (piecesJointes.length === 0) {
      return challenge;
    }
    this._loadingMessage('Gestion des pièces jointes...');
    await Promise.all(piecesJointes.map((pieceJointe) => this._handlePieceJointe(pieceJointe, challenge)));
    await this._renamePiecesJointes(challenge);

    return challenge;
  }

  async _handlePieceJointe(pieceJointe) {
    if (!pieceJointe.isNew || pieceJointe.cloneBeforeSave) {
      return;
    }
    const remoteFile = await this.storage.uploadFile({ file: pieceJointe.file, filename: pieceJointe.filename, isAttachment: true });
    pieceJointe.url = remoteFile.url;
  }

  async _renamePiecesJointes(challenge) {
    if (!challenge.baseNameUpdated()) {
      return;
    }
    const piecesJointes = (await challenge.piecesJointes)?.slice() ?? [];
    for (const pieceJointe of piecesJointes) {
      pieceJointe.filename = this._getPieceJointeFullFilename(challenge, pieceJointe.filename);
      await this.storage.renameFile(pieceJointe.url, pieceJointe.filename);
    }
  }

  _getPieceJointeFullFilename(challenge, filename) {
    return challenge.attachmentBaseName + '.' + this.filePath.getExtension(filename);
  }

  _saveChallenge(challenge) {
    this._loadingMessage('Enregistrement...');

    return challenge.save();
  }

  async _saveFiles(challenge) {
    const attachments = (await challenge.attachments)?.slice() ?? [];
    for (const attachment of attachments) {
      if (attachment.cloneBeforeSave) {
        attachment.url = await this.storage.cloneFile(attachment.url);
        attachment.cloneBeforeSave = false;
      }
      await attachment.save();
    }
    for (const deletedFile of this.deletedFiles) {
      await deletedFile.save();
    }
    this.deletedFiles = [];
    return challenge;
  }

  async _handleChangelog(challenge, changelog) {
    if (!changelog) {
      return;
    }
    const entry = this.store.createRecord('changelog-entry', {
      text: changelog,
      elementId: challenge.id,
      author: this.config.author,
      elementType: this.changelogEntry.challenge,
    });
    await entry.save();
    await challenge.hasMany('changelogEntries').reload();
  }

  _message(text) {
    this.notify.message(text);
  }

  _loadingMessage(text) {
    this.loader.start(text);
  }

  _errorMessage(text) {
    this.notify.error(text);
  }

  _error(text) {
    this._errorMessage(text);
    return Promise.reject();
  }

  _displayChangelogPopIn(defaultMessage, callback) {
    this.changelogCallback = callback;
    this.changelogDefault = defaultMessage;
    this.displayChangeLog = true;
  }

  @action
  checkEmbedURL() {
    this.invalidEmbedURL = '';
    let embedURL = this.challenge.embedURL;
    embedURL = embedURL.trim();
    try {
      new URL(embedURL);
      return true;
    } catch {
      this.challenge.embedURL = null;
      this.invalidEmbedURL = embedURL;
    }
  }

  @action
  async toggleStatusActionMenu() {
    this.isStatusActionMenuOpen = !this.isStatusActionMenuOpen;
  }

  @action
  async hideStatusActionMenu(event) {
    const challengeSelector = document.getElementById(this.challengeStatusActionsId);
    if (!event.relatedTarget || !challengeSelector.contains(event.relatedTarget)) {
      this.isStatusActionMenuOpen = false;
    }
  }
}
