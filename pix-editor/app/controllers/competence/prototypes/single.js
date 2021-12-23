import Controller, { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Sentry from '@sentry/ember';
import yaml from 'js-yaml';

export default class SingleController extends Controller {

  wasMaximized = false;
  changelogCallback = null;
  defaultSaveChangelog = 'Mise à jour du prototype';
  elementClass = 'prototype-challenge';

  @tracked edition = false;
  @tracked displayAlternativeInstructionsField = false;
  @tracked displaySolutionToDisplayField = false;
  @tracked creation = false;
  @tracked popinImageSrc = '';
  @tracked displayImage = false;
  @tracked displaySelectLocation = false;
  @tracked displayChallengeLog = false;
  @tracked displayChangeLog = false;
  @tracked copyOperation = false;
  @tracked changelogDefault = '';

  @service config;
  @service store;
  @service access;
  @service storage
  @service filePath;
  @service currentData;
  @service notify;
  @service loader;
  @service confirm;
  @service changelogEntry;
  @service intl;

  get maximized() {
    return this.parentController.leftMaximized;
  }

  get challenge() {
    return this.model;
  }

  @controller('competence')
  parentController

  get challengeTitle() {
    if (this.creation) {
      return 'Nouveau prototype';
    } else if (this.challenge.isWorkbench) {
      return '';
    } else {
      return this.challenge.skillNames;
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

  get mayAccessAirtable() {
    return this.access.mayAccessAirtable();
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
    if (challenge.skillLevels[0]) {
      return challenge.skillLevels;
    } else {
      return false;
    }
  }

  get previewUrl() {
    return this.challenge.preview;
  }


  get airtableUrl() {
    return `${this.config.airtableUrl}${this.config.tableChallenges}/${ this.challenge.id}`;
  }

  get lastUpdatedAtISO() {
    return this.challenge.updatedAt.toISOString();
  }

  @action
  setDisplayAlternativeInstructionsField(value) {
    this.displayAlternativeInstructionsField = value;
  }

  @action
  setDisplaySolutionToDisplayField(value) {
    this.displaySolutionToDisplayField = value;
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
  copyLink() {
    this.copyOperation = true;
  }

  @action
  linkCopied(result) {
    this.copyOperation = false;
    if (result) {
      this._message('lien copié');
    } else {
      this._errorMessage('Erreur lors de la copie');
    }
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
    this.challenge.rollbackAttributes();
    await this.challenge.files;
    this.challenge.files.forEach((file) => file.rollbackAttributes());
    if (!this.wasMaximized) {
      this.minimize();
    }
    this._message('Modification annulée');
  }

  @action
  save() {
    if (!this._saveCheck(this.challenge)) {
      return;
    }
    this._displayChangelogPopIn(this.defaultSaveChangelog, this._saveChallengeCallback);
  }

  async _saveChallengeCallback(changelog) {
    this.loader.start();
    return Promise.resolve(this.challenge)
      .then(challenge => this._handleIllustration(challenge))
      .then(challenge => this._handleAttachments(challenge))
      .then(challenge => this._saveChallenge(challenge))
      .then(challenge => this._saveAttachments(challenge))
      .then(challenge => this._handleChangelog(challenge, changelog))
      .then(() => {
        this.edition = false;
        this.displayAlternativeInstructionsField = false;
        this.displaySolutionToDisplayField = false;
        if (!this.wasMaximized) {
          this.minimize();
        }
        this._message('Épreuve mise à jour');
      })
      .catch((error) => {
        console.error(error);
        Sentry.captureException(error);
        this._errorMessage('Erreur lors de la mise à jour');
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
    this.transitionToRoute('competence.prototypes.single.alternatives', this.currentData.getCompetence(), this.challenge);
  }

  @action
  async validate(dropdown) {
    if (dropdown) {
      dropdown.actions.close();
    }
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
          await this._checkSkillsValidation(challenge);
          await this._validateAlternatives(challenge);
          this._message('Mise en production réussie');
          this.parentController.send('selectView', 'production', true);
        } catch (error) {
          console.error(error);
          Sentry.captureException(error);
          this._errorMessage('Erreur lors de la mise en production');
        } finally {
          this.loader.stop();
        }});
    } catch (error) {
      this._message('Mise en production abandonnée');
    }
  }

  @action
  async archive(dropdown) {
    if (dropdown) {
      dropdown.actions.close();
    }
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
        } catch (error) {
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
  async obsolete(dropdown) {
    if (dropdown) {
      dropdown.actions.close();
    }
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
    const skill = await this.challenge.firstSkill;
    const tube = await skill.get('tube');
    this.transitionToRoute('competence.prototypes.list', tube.id, skill.id);
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
  setSkills(skills) {
    if (skills.length === 0) {
      this._errorMessage('Aucun acquis sélectionné');
      return;
    }
    this._displayChangelogPopIn('Changement d\'acquis de l\'épreuve', (changelog) => {
      this.loader.start();
      const prototype = this.challenge;
      const prototypeVersion = this._getNextPrototypeVersion(skills);
      const challenges = this.challenge.alternatives;
      challenges.pushObject(prototype);
      const updateChallenges = challenges.reduce((current, challenge) => {
        challenge.skills = skills;
        challenge.version = prototypeVersion;
        current.push(challenge.save()
          .then(() => {
            if (challenge.isPrototype) {
              this._message('Changement d\'acquis effectué pour le prototype');
            } else {
              this._message(`Changement d'acquis effectué pour la déclinaison n°${challenge.alternativeVersion}`);
            }
          })
        );
        return current;
      }, []);
      return Promise.all(updateChallenges)
        .then(() => this._handleChangelog(prototype, changelog))
        .finally(() => this.loader.stop());
    });
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
    } catch (e) {
      return false;
    }
  }

  _validationChecks(challenge) {
    this._loadingMessage('Vérifications');
    if (challenge.isValidated) {
      return this._error('L\'épreuve est déjà en production');
    }
    if (challenge.isPrototype) {
      if (challenge.firstSkill == null) {
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
    const productionPrototype = challenge.firstSkill.productionPrototype;
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
    await this.confirm.ask('Mise en production des déclinaisons', 'Souhaitez-vous mettre en production les déclinaisons proposées ?');
    const alternativesPublication = alternatives.map(async alternative => {
      const validatedAlternative = await alternative.validate();
      this._message(`Alternative n°${validatedAlternative.alternativeVersion} mise en production`);
    });
    return Promise.all(alternativesPublication);
  }

  _archiveAlternatives(challenge) {
    if (!challenge.isPrototype) {
      return Promise.resolve(challenge);
    }
    const toArchive = challenge.productionAlternatives;
    const toObsolete = challenge.draftAlternatives;
    if (toArchive.length === 0 && toObsolete.length) {
      return Promise.resolve(challenge);
    }
    const alternativesArchive = toArchive.map(alternative => {
      return alternative.archive()
        .then(alternative => this._message(this.intl.t('challenge.alternative.archive', { number: alternative.alternativeVersion })));
    });
    const alternativesObsolete = toObsolete.map(alternative => {
      return alternative.obsolete()
        .then(alternative => this._message(this.intl.t('challenge.alternative.obsolete', { number: alternative.alternativeVersion })));
    });
    const alternativesArchiveAndObsolete = [...alternativesArchive, ...alternativesObsolete];
    return Promise.all(alternativesArchiveAndObsolete)
      .then(() => challenge);
  }

  _obsoleteAlternatives(challenge) {
    if (!challenge.isPrototype) {
      return Promise.resolve(challenge);
    }
    const toObsolete = challenge.alternatives.filter(alternative => !alternative.isObsolete);
    if (toObsolete.length === 0) {
      return Promise.resolve(challenge);
    }
    const alternativesObsolete = toObsolete.map(alternative => {
      return alternative.obsolete()
        .then(alternative => this._message(this.intl.t('challenge.alternative.obsolete', { number: alternative.alternativeVersion })));
    });
    return Promise.all(alternativesObsolete)
      .then(() => challenge);
  }

  async _archiveOtherActiveSkillVersion(challenge) {
    const currentSkill = challenge.firstSkill;
    if (!challenge.isPrototype || currentSkill.isActive) {
      return;
    }
    const tube = await currentSkill.tube;
    const skillVersions = tube.filledLiveSkills[currentSkill.level - 1];
    const activeSkill = skillVersions.find(skill => skill.isActive);
    if (!activeSkill) {
      return;
    }
    await this.confirm.ask('Archivage de la version précédente de l\'acquis', `La mise en production de ce prototype va remplacer l'acquis précédent (${activeSkill.pixId}) par le nouvel acquis (${currentSkill.pixId}). Êtes-vous sûr de vouloir archiver l'acquis ${activeSkill.pixId} et les épreuves correspondantes ?`);
    await activeSkill.archive();
    const challengesToArchiveOrObsolete = activeSkill.liveChallenges.map(liveChallenge => {
      if (liveChallenge.isValidated) {
        return liveChallenge.archive();
      }
      if (liveChallenge.isDraft) {
        return liveChallenge.obsolete();
      }
    });
    await Promise.all(challengesToArchiveOrObsolete);
  }

  _checkSkillsValidation(challenge) {
    const skills = challenge.skills;
    if (skills.length === 0) {
      return Promise.resolve(challenge);
    }
    const skillChecks = skills.reduce((current, skill) => {
      const prototypeProduction = skill.productionPrototype;
      if (prototypeProduction) {
        if (!skill.isActive) {
          current.push(skill.activate()
            .then(skill => {
              this._message(`Activation de l'acquis ${skill.name}`);
              return skill;
            }));
        }
      } else {
        if (skill.isActive) {
          current.push(skill.deactivate()
            .then(skill => {
              this._message(`Désactivation de l'acquis ${skill.name}`);
              return skill;
            }));
        }
      }
      return current;
    }, []);
    return Promise.all(skillChecks).then(() => challenge);
  }

  _archiveOrDeactivateSkill(challenge) {
    const skill = challenge.firstSkill;
    const isProductionPrototype = skill.productionPrototype?.id === challenge.id;
    if (!isProductionPrototype) {
      return;
    }
    const prototypesStatusOtherVersion = skill.prototypes
      .filter((prototype) => prototype.id !== challenge.id)
      .map((prototype) => prototype.status);
    const haveProposalPrototype = prototypesStatusOtherVersion.includes('proposé');
    if (haveProposalPrototype) {
      return skill.deactivate();
    }
    return skill.archive();
  }

  _obsoleteArchiveOrDeactivateSkill(challenge) {
    const skill = challenge.firstSkill;
    const isProductionPrototype = skill.productionPrototype?.id === challenge.id;
    if (!isProductionPrototype) {
      return;
    }
    const prototypesStatusOtherVersion = skill.prototypes
      .filter((prototype) => prototype.id !== challenge.id)
      .map((prototype) => prototype.status);
    if (prototypesStatusOtherVersion.includes('proposé')) {
      return skill.deactivate();
    }
    if (prototypesStatusOtherVersion.includes('archivé')) {
      return skill.archive();
    }
    return skill.obsolete();
  }

  async _handleIllustration(challenge) {
    const illustration = challenge.illustration;
    if (illustration && illustration.isNew && !illustration.cloneBeforeSave) {
      this._loadingMessage('Envoi de l\'illustration...');
      const newIllustration = await this.storage.uploadFile({ file: illustration.file });
      challenge.illustration.url = newIllustration.url;
    }
    return challenge;
  }

  async _handleAttachments(challenge) {
    const attachments = challenge.attachments;
    if (attachments.length === 0) {
      return challenge;
    }
    this._loadingMessage('Gestion des pièces jointes...');
    await Promise.all(attachments.map((attachment) => this._handleAttachment(attachment, challenge)));
    await this._renameAttachmentFiles(challenge);

    return challenge;
  }

  async _handleAttachment(attachment) {
    if (!attachment.isNew || attachment.cloneBeforeSave) {
      return;
    }
    const newAttachment = await this.storage.uploadFile({ file: attachment.file, filename: attachment.filename, isAttachment: true });
    attachment.url = newAttachment.url;
  }

  async _renameAttachmentFiles(challenge) {
    if (!challenge.baseNameUpdated()) {
      return;
    }
    const attachments = await challenge.attachments;
    for (const file of attachments.toArray()) {
      file.filename = this._getAttachmentFullFilename(challenge, file.filename);
      await this.storage.renameFile(file.url, file.filename);
    }
  }

  _getAttachmentFullFilename(challenge, filename) {
    return challenge.attachmentBaseName + '.' + this.filePath.getExtension(filename);
  }

  _saveChallenge(challenge) {
    this._loadingMessage('Enregistrement...');
    return challenge.save();
  }

  async _saveAttachments(challenge) {
    await challenge.files;
    for (const file of challenge.files.toArray()) {
      if (file.cloneBeforeSave) {
        file.url = await this.storage.cloneFile(file.url);
        file.cloneBeforeSave = false;
      }
      await file.save();
    }
    return challenge;
  }

  async _handleChangelog(challenge, changelog) {
    if (!changelog) {
      return;
    }
    const entry = this.store.createRecord('changelogEntry', {
      text: changelog,
      recordId: challenge.id,
      author: this.config.author,
      createdAt: (new Date()).toISOString(),
      elementType: this.changelogEntry.challenge
    });
    await entry.save();
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

  _getNextPrototypeVersion(skills) {
    return skills.map(skill => skill.getNextPrototypeVersion()).reduce((current, version) => {
      return Math.max(version, current);
    }, 1);
  }
}
