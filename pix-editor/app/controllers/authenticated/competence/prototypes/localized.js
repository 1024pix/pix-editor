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

  options = {
    geography: ['Afghanistan','Afrique du Sud','Albanie','Algérie','Allemagne','Andorre','Angola','Antigua-et-Barbuda','Arabie saoudite','Argentine','Arménie','Australie','Autriche','Azerbaïdjan','Bahamas','Bahreïn','Bangladesh','Barbade','Belgique','Belize','Bénin','Bhoutan','Biélorussie','Birmanie','Bolivie','Bosnie-Herzégovine','Botswana','Brésil','Brunei','Bulgarie','Burkina Faso','Burundi','Cambodge','Cameroun','Canada','Cap-Vert','Chili','Chine','Chypre','Colombie','Les Comores','Congo','Îles Cook','Corée du Nord','Corée du Sud','Costa Rica','Côte d\'ivoire','Croatie','Cuba','Danemark','Djibouti','République dominicaine','Dominique','Égypte','Émirats arabes unis','Équateur','Érythrée','Espagne','Estonie','Eswatini','Éthiopie','Fidji','Finlande','France','Gabon','Gambie','Géorgie','Ghana','Grèce','Grenade','Guinée','Guatémala','Guinée équatoriale','Guinée-Bissao','Guyana','Haïti','Honduras','Hongrie','Inde','Indonésie','Institutions internationales','Irak','Iran','Irlande','Islande','Israël','Italie','Jamaïque','Japon','Jordanie','Kazakhstan','Kenya','Kirghizstan','Kiribati','Kosovo','Koweït','Laos','Lésotho','Lettonie','Liban','Libéria','Libye','Liechtenstein','Lituanie','Luxembourg','Macédoine du Nord','Madagascar','Malaisie','Malawi','Maldives','Mali','Malte','Maroc','Îles Marshall','Maurice','Mauritanie','Mexique','Micronésie','Moldavie','Monaco','Mongolie','Monténégro','Mozambique','Namibie','Nauru','Népal','Neutre','Nicaragua','Niger','Nigéria','Niue','Norvège','Nouvelle-Zélande','Oman','Ouganda','Ouzbékistan','Pakistan','Palaos','La Palestine','Panama','Papouasie-Nouvelle-Guinée','Paraguay','Pays-Bas','Pérou','Philippines','Pologne','Portugal','Qatar','République centrafricaine','Roumanie','Russie','Rwanda','Saint-Christophe-et-Niévès','Sainte-Lucie','Saint-Marin','Saint-Vincent-et-les-Grenadines','Salomon','Salvador','Samoa','Sao Tomé-et-Principe','Sénégal','Serbie','Sierra Leone','Singapour','Slovaquie','Slovénie','Somalie','Soudan','Soudan du Sud','Sri Lanka','Suède','Suisse','Suriname','Syrie','Tadjikistan','Tanzanie','Tchad','Tchéquie','Thaïlande','Timor oriental','Togo','Tonga','Trinité-et-Tobago','Tunisie','Turkménistan','Turquie','Tuvalu','UK','Ukraine','Uruguay','USA','Vanuatu','Vatican','Vénézuéla','Vietnam','Yémen','Zambie','Zimbabwé'],
  };

  deletedFiles = [];

  get challenge() {
    return this.model.challenge;
  }

  get localizedChallenge() {
    return this.model.localizedChallenge;
  }


  get previewUrl() {
    return new URL(`${this.challenge.preview}?locale=${this.localizedChallenge.locale}`, window.location).href;
  }

  get translationsUrl() {
    return new URL(`${this.localizedChallenge.translations}`, window.location).href;
  }

  get challengeRoute() {
    return this.isPrototype ? 'authenticated.competence.prototypes.single' : 'authenticated.competence.prototypes.single.alternatives.single';
  }

  get challengeModels() {
    return this.isPrototype
      ? [this.challenge]
      : [this.challenge.relatedPrototype, this.challenge];
  }

  get challengeTitle() {
    return this.isPrototype
      ? this.challenge.skillName
      : `Déclinaison n°${this.challenge.alternativeVersion}`;
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

  @action
  showIllustration() {
    this.displayIllustration = true;
  }

  @action closeIllustration() {
    this.displayIllustration = false;
  }

  @action async confirmApprove() {
    this.localizedChallenge.status = this.localizedChallenge.isInProduction ? 'proposé' : 'validé';
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
    this.localizedChallenge.rollbackAttributes();
    await this.model.files;
    this.localizedChallenge.files.forEach((file) => file.rollbackAttributes());
    this.deletedFiles = [];
    if (!this.wasMaximized) {
      this.minimize();
    }
    this.notify.message('Modification annulée');
  }

  @action async save() {
    this.loader.start();
    try {
      await this._handleIllustration(this.localizedChallenge);
      await this._handleAttachments(this.localizedChallenge);
      await this._saveAttachments(this.localizedChallenge);
      await this._saveChallenge(this.localizedChallenge);
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
      localizedChallenge: this.localizedChallenge,
      challenge: this.challenge,
      alt,
    };
    this.store.createRecord('attachment', attachment);
  }

  @action
  async removeIllustration() {
    await this.localizedChallenge.files;
    const removedFile = this.localizedChallenge.illustration;
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
      localizedChallenge: this.localizedChallenge,
      challenge: this.challenge,
    };
    this.store.createRecord('attachment', attachment);
  }

  @action
  async removeAttachment(removedAttachment) {
    await this.localizedChallenge.files;
    const removedFile = this.localizedChallenge.files.findBy('filename', removedAttachment.filename);
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
