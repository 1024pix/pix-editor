import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import * as Sentry from '@sentry/ember';
import getMimeType from 'pixeditor/helpers/get-mime-type';
import Challenge from 'pixeditor/models/challenge';

export default class LocalizedController extends Controller {
  @service router;
  @service access;
  @service notifications;
  @service loader;
  @service store;
  @service storage;
  @service filePath;
  @service countries;

  @tracked edition = false;
  @tracked displayConfirm = false;
  @tracked popInImageSrc = null;
  @tracked displayIllustration = false;
  @tracked displayUrlsToConsultField = false;

  @tracked urlsToConsult = '';
  @tracked invalidEmbedURL = '';
  @tracked invalidUrlsToConsult = '';
  helpUrlsToConsult = '<p>Séparer les liens par un retour à la ligne</p>';

  @controller('authenticated.competence') competenceController;
  @controller('authenticated.competence.prototypes.single.alternatives') alternativesController;

  deletedFiles = [];

  get countryList() {
    return this.countries.list.map((country) => ({
      label: country.name,
      value: country.code,
    }));
  }

  get challenge() {
    return this.model.challenge;
  }

  get localizedChallenge() {
    return this.model.localizedChallenge;
  }

  get competence() {
    return this.model.competence;
  }

  get previewUrl() {
    return new URL(`${this.challenge.preview}?locale=${this.localizedChallenge.locale}`, window.location).href;
  }

  get translationsUrl() {
    return new URL(this.localizedChallenge.translations, window.location).href;
  }

  get challengeRoute() {
    return this.isPrototype
      ? 'authenticated.competence.prototypes.single'
      : 'authenticated.competence.prototypes.single.alternatives.single';
  }

  get challengeModels() {
    return this.isPrototype ? [this.challenge] : [this.challenge.relatedPrototype, this.challenge];
  }

  get challengeTitle() {
    return this.isPrototype ? this.challenge.skillName : `Déclinaison n°${this.challenge.alternativeVersion}`;
  }

  get isPrototype() {
    return this.challenge.isPrototype;
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
    return this.access.mayEdit(this.challenge);
  }

  get mayChangeStatus() {
    return this.access.mayChangeLocalizedChallengeStatus(this.localizedChallenge);
  }

  get changeStatusButtonText() {
    return this.localizedChallenge.isInProduction ? 'Mettre en pause' : 'Mettre en prod';
  }

  get changeStatusButtonIcon() {
    return this.localizedChallenge.isInProduction ? 'pause' : 'play';
  }

  get confirmTitle() {
    return this.localizedChallenge.isInProduction ? 'Mise en pause' : 'Mise en prod';
  }

  get confirmContent() {
    return this.localizedChallenge.isInProduction
      ? 'Êtes-vous sûr de vouloir mettre en pause cette épreuve ?'
      : 'Êtes-vous sûr de vouloir mettre en prod cette épreuve ?';
  }

  get shouldDisplayPrimaryEmbedUrl() {
    return !this.localizedChallenge.embedURL && this.challenge.embedURL;
  }

  get displayUrlsToConsult() {
    return this.edition || this.localizedChallenge.urlsToConsult;
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
    this.localizedChallenge.urlsToConsult = values;
    this.urlsToConsult = this.localizedChallenge.urlsToConsult?.join('\n') ?? '';
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
    this.displayIllustration = true;
  }

  @action closeIllustration() {
    this.displayIllustration = false;
  }

  @action async confirmApprove() {
    this.localizedChallenge.status = this.localizedChallenge.isInProduction
      ? Challenge.STATUSES.PROPOSE
      : Challenge.STATUSES.VALIDE;
    try {
      await this._saveChallenge(this.localizedChallenge);
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
      this.notifications.sendError("Erreur lors de la mise à jour de l'épreuve");
    } finally {
      this.loader.stop();
      this.displayConfirm = false;
    }
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
    this.localizedChallenge.rollbackAttributes();
    this.urlsToConsult = this.localizedChallenge.urlsToConsult?.join('\n') ?? '';
    this.displayUrlsToConsultField = false;
    this.invalidUrlsToConsult = '';
    this.invalidEmbedURL = '';
    await this.localizedChallenge.attachments;
    this.localizedChallenge.attachments.forEach((attachment) => attachment.rollbackAttributes());
    this.deletedFiles = [];
    if (!this.wasMaximized) {
      this.minimize();
    }
    this.notifications.sendSuccess('Modification annulée');
  }

  @action async save() {
    this.loader.start();
    try {
      await this._handleIllustration(this.localizedChallenge);
      await this._handlePiecesJointes(this.localizedChallenge);
      await this._saveFiles(this.localizedChallenge);
      await this._saveChallenge(this.localizedChallenge);
      this.edition = false;
      this.invalidUrlsToConsult = '';
      this.displayUrlsToConsultField = false;
      this.loader.stop();
      this.notifications.sendSuccess('Épreuve mise à jour');
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
      this.loader.stop();
      this.notifications.sendError("Erreur lors de la mise à jour de l'épreuve");
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
      this.router.transitionTo('authenticated.competence.prototypes', this.competenceController.competence, {
        queryParams: { leftMaximized: false },
      });
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
  async addIllustration(file, alt = '') {
    const attachmentData = {
      filename: file.name,
      size: file.size,
      mimeType: getMimeType(file),
      file,
      type: 'illustration',
      alt,
    };
    const attachment = this.store.createRecord('attachment', attachmentData);
    const attachments = await this.challenge.attachments;
    const localizedAttachmentses = await this.localizedChallenge.attachments;
    attachments.push(attachment);
    localizedAttachmentses.push(attachment);
  }

  @action
  async removeIllustration() {
    await this.localizedChallenge.attachments;
    const removedFile = this.localizedChallenge.illustration;
    if (removedFile) {
      removedFile.deleteRecord();
      if (!removedFile.isNew) {
        this.deletedFiles.push(removedFile);
      }
      return removedFile.alt;
    }
  }

  @action
  async addAttachment(file) {
    const attachmentData = {
      filename: file.name,
      size: file.size,
      mimeType: getMimeType(file),
      file,
      type: 'attachment',
    };
    const attachment = this.store.createRecord('attachment', attachmentData);
    const attachments = await this.challenge.attachments;
    const localizedAttachmentses = await this.localizedChallenge.attachments;
    attachments.push(attachment);
    localizedAttachmentses.push(attachment);
  }

  @action
  async removeAttachment(removedAttachment) {
    const attachments = await this.localizedChallenge.attachments;
    const removedFile = attachments.find((file) => file.filename === removedAttachment.filename);
    if (removedFile) {
      removedFile.deleteRecord();
      if (!removedFile.isNew) {
        this.deletedFiles.push(removedFile);
      }
    }
  }

  async _handleIllustration(challenge) {
    const illustration = challenge.illustration;
    if (illustration && illustration.isNew) {
      this.loader.start("Envoi de l'illustration...");
      const newIllustration = await this.storage.uploadFile({ file: illustration.file });
      challenge.illustration.url = newIllustration.url;
    }
    return challenge;
  }

  async _handlePiecesJointes(challenge) {
    const piecesJointes = challenge.piecesJointes;
    if (piecesJointes.length === 0) {
      return challenge;
    }
    this.loader.start('Gestion des pièces jointes...');
    await Promise.all(piecesJointes.map((pieceJointe) => this._handlePieceJointe(pieceJointe, challenge)));
    await this._renamePiecesJointes(challenge);

    return challenge;
  }

  async _handlePieceJointe(pieceJointe) {
    if (!pieceJointe.isNew) {
      return;
    }
    const remoteFile = await this.storage.uploadFile({
      file: pieceJointe.file,
      filename: pieceJointe.filename,
      isAttachment: true,
    });
    pieceJointe.url = remoteFile.url;
  }

  async _renamePiecesJointes(challenge) {
    if (!challenge.baseNameUpdated()) {
      return;
    }

    const piecesJointes = await challenge.piecesJointes;
    for (const pieceJointe of [...piecesJointes]) {
      pieceJointe.filename = this._getPieceJointeFullFilename(challenge, pieceJointe.filename);
      await this.storage.renameFile(pieceJointe.url, pieceJointe.filename);
    }
  }

  _getPieceJointeFullFilename(challenge, filename) {
    return challenge.attachmentBaseName + '.' + this.filePath.getExtension(filename);
  }

  async _saveChallenge(challenge) {
    this.loader.start('Enregistrement...');
    return challenge.save();
  }

  async _saveFiles(challenge) {
    const attachments = (await challenge.attachments)?.slice() ?? [];
    for (const attachment of attachments) {
      await attachment.save();
    }
    for (const attachment of this.deletedFiles) {
      await attachment.save();
    }
    this.deletedFiles = [];
    return challenge;
  }

  @action
  checkEmbedURL() {
    this.invalidEmbedURL = '';
    let embedURL = this.localizedChallenge.embedURL;
    embedURL = embedURL.trim();
    try {
      new URL(embedURL);
      return true;
    } catch {
      this.localizedChallenge.embedURL = '';
      this.invalidEmbedURL = embedURL;
    }
  }
}
