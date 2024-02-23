import Controller, { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import * as Sentry from '@sentry/ember';

export default class LocalizedController extends Controller {

  @service router;
  @service access;
  @service notify;
  @service loader;
  @service store;
  @service storage;
  @service filePath;

  @tracked edition = false;
  @tracked displayConfirm = false;
  @tracked popInImageSrc = null;
  @tracked displayIllustration = false;

  @controller('authenticated.competence') competenceController;
  @controller('authenticated.competence.prototypes.single.alternatives') alternativesController;

  deletedFiles = [];

  get previewUrl() {
    return new URL(`${this.model.challenge.get('preview')}?locale=${this.model.locale}`, window.location).href;
  }

  get challengeRoute() {
    return this.isPrototype ? 'authenticated.competence.prototypes.single' : 'authenticated.competence.prototypes.single.alternatives.single';
  }

  get challengeModels() {
    return this.isPrototype
      ? [this.model.challenge]
      : [this.model.challenge.get('relatedPrototype'), this.model.challenge];
  }

  get challengeTitle() {
    return this.isPrototype
      ? this.model.challenge.get('skillName')
      : `Déclinaison n°${this.model.challenge.get('alternativeVersion')}`;
  }

  get isPrototype() {
    return this.model.challenge.get('isPrototype');
  }

  get prototypeMaximized() {
    return this.competenceController.leftMaximized;
  }

  get alternativeMaximized() {
    return this.alternativesController.rightMaximized;
  }

  get maximized() {
    return this.isPrototype ? this.prototypeMaximized : this.alternativeMaximized;
  }

  get mayEdit() {
    return this.access.mayEdit(this.model.challenge);
  }

  get mayChangeStatus() {
    return this.access.mayChangeLocalizedChallengeStatus(this.model);
  }

  get changeStatusButtonText() {
    return this.model.isInProduction ? 'Mettre en pause' : 'Mettre en prod';
  }

  get changeStatusButtonIcon() {
    return this.model.isInProduction ? 'pause' : 'play';
  }

  get confirmTitle() {
    return this.model.isInProduction ? 'Mise en pause' : 'Mise en prod';
  }

  get confirmContent() {
    return this.model.isInProduction
      ? 'Êtes-vous sûr de vouloir mettre en pause cette épreuve ?'
      : 'Êtes-vous sûr de vouloir mettre en prod cette épreuve ?';
  }

  @action
  showIllustration() {
    this.displayIllustration = true;
  }

  @action closeIllustration() {
    this.displayIllustration = false;
  }

  @action async confirmApprove() {
    this.model.status = this.model.isInProduction ? 'proposé' : 'validé';
    await this.save();
    this.displayConfirm = false;
  }

  @action confirmDeny() {
    this.displayConfirm = false;
  }

  @action editStatus() {
    this.displayConfirm = true;
  }

  @action edit() {
    this.edition = true;
  }

  @action async cancelEdit() {
    this.edition = false;
    this.model.rollbackAttributes();
    await this.model.files;
    this.model.files.forEach((file) => file.rollbackAttributes());
    this.deletedFiles = [];
    if (!this.wasMaximized) {
      this.minimize();
    }
    this.notify.message('Modification annulée');
  }

  @action async save() {
    this.loader.start();
    try {
      await this._handleIllustration(this.model);
      await this._handleAttachments(this.model);
      await this._saveAttachments(this.model);
      await this._saveChallenge(this.model);
      this.edition = false;
      this.loader.stop();
      this.notify.message('Épreuve mise à jour');
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
      this.loader.stop();
      this.notify.error('Erreur lors de la mise à jour de l\'épreuve');
    }
  }

  @action maximize() {
    if (this.isPrototype) {
      this.competenceController.maximizeLeft(true);
    } else {
      this.alternativesController.maximizeRight(true);
    }
  }

  @action minimize() {
    if (this.isPrototype) {
      this.competenceController.maximizeLeft(false);
    } else {
      this.alternativesController.maximizeRight(false);
    }
  }

  @action close() {
    if (this.isPrototype) {
      this.router.transitionTo(
        'authenticated.competence.prototypes',
        this.competenceController.competence,
        { queryParams: { leftMaximized: false } },
      );
    } else {
      this.router.transitionTo(
        'authenticated.competence.prototypes.single.alternatives',
        this.competenceController.competence,
        this.alternativesController.challenge,
        { queryParams: { rightMaximized: false } },
      );
    }
  }

  @action
  addIllustration(file, alt = '') {
    const attachment = {
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      file,
      type: 'illustration',
      localizedChallenge: this.model,
      challenge: this.model.challenge,
      alt,
    };
    this.store.createRecord('attachment', attachment);
  }

  @action
  async removeIllustration() {
    await this.model.files;
    const removedFile = this.model.illustration;
    if (removedFile) {
      removedFile.deleteRecord();
      this.deletedFiles.push(removedFile);
      return removedFile.alt;
    }
  }

  @action
  addAttachment(file) {
    const attachment = {
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      file,
      type: 'attachment',
      localizedChallenge: this.model,
      challenge: this.model.challenge,
    };
    this.store.createRecord('attachment', attachment);
  }

  @action
  async removeAttachment(removedAttachment) {
    await this.model.files;
    const removedFile = this.model.files.findBy('filename', removedAttachment.filename);
    if (removedFile) {
      removedFile.deleteRecord();
      this.deletedFiles.push(removedFile);
    }
  }

  async _handleIllustration(challenge) {
    const illustration = challenge.illustration;
    if (illustration && illustration.isNew) {
      this.loader.start('Envoi de l\'illustration...');
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
    this.loader.start('Gestion des pièces jointes...');
    await Promise.all(attachments.map((attachment) => this._handleAttachment(attachment, challenge)));
    await this._renameAttachmentFiles(challenge);

    return challenge;
  }

  async _handleAttachment(attachment) {
    if (!attachment.isNew) {
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

  async _saveChallenge(challenge) {
    this.loader.start('Enregistrement...');
    return challenge.save();
  }

  async _saveAttachments(challenge) {
    await challenge.files;

    for (const file of challenge.files.toArray()) {
      await file.save();
    }
    for (const file of this.deletedFiles) {
      await file.save();
    }
    this.deletedFiles = [];
    return challenge;
  }
}
