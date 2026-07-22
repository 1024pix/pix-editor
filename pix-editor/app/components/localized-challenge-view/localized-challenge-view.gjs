import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import getMimeType from 'pixeditor/helpers/get-mime-type';
import Challenge from 'pixeditor/models/challenge';

import PopInConfirm from '../pop-in/confirm';
import PopInImage from '../pop-in/image';
import Files from '../v2/field/files';
import Illustration from '../v2/field/illustration';
import FieldToggleFieldComponent from '../v2/field/toggle-field';
import LocalizedChallengeViewHeader from './localized-challenge-view-header';

export default class LocalizedChallenge extends Component {
  textareaId = `textareaId-${guidFor(this)}`;

  @service countries;
  @service loader;
  @service notifications;
  @service store;
  @service storage;
  @service filePath;

  @tracked embedURLValidationStatus = 'default';
  @tracked invalidUrlsToConsult = '';
  @tracked displayUrlsToConsultField = false;
  @tracked isPopInIllustrationDisplayed = false;
  @tracked urlsToConsult = this.args.localizedChallenge.urlsToConsult?.join('\n');
  @tracked attachmentBasename = '';
  @tracked displayConfirm = false;
  @tracked confirmTitle = '';
  @tracked confirmContent = '';
  @tracked confirmApprove;

  @tracked urlsToConsultTextareaHeigh = this.args.localizedChallenge.urlsToConsult?.length ?? 2;

  deletedFiles = [];

  get readonly() {
    return !this.args.edition;
  }

  get primaryChallenge() {
    return this.args.challengeLocale.challenge;
  }

  get countryList() {
    return this.countries.list.map((country) => ({
      label: country.name,
      value: country.code,
    }));
  }

  get localizedChallengeGeographyValue() {
    return this.args.localizedChallenge.geography || 'AA';
  }

  get embedURL() {
    const { localizedChallenge } = this.args;
    return localizedChallenge.embedURL ? localizedChallenge.embedURL : localizedChallenge.defaultEmbedURL;
  }

  get shouldDisplayEmbedURL() {
    return !!this.primaryChallenge.embedURL;
  }

  get shouldDisplayInputEmbedURL() {
    return !!this.args.localizedChallenge.embedURL || this.args.edition;
  }

  get shouldDisplayAttachment() {
    return !!this.primaryChallenge.piecesJointes.length;
  }

  get shouldDisplayIllustration() {
    return !!this.primaryChallenge.illustration;
  }

  @action
  async openSaveConfirmPopin() {
    this.confirmTitle = 'Enregistrer les modifications';
    this.confirmContent = 'Êtes vous sûr de vouloir enregistrer ?';
    this.confirmApprove = this.save;
    this.displayConfirm = true;
  }

  @action
  async openProductionStatusConfirmPopin() {
    this.confirmTitle = this.args.localizedChallenge.isInProduction ? 'Mise en pause' : 'Mise en prod';
    this.confirmContent = this.args.localizedChallenge.isInProduction
      ? 'Êtes-vous sûr de vouloir mettre en pause cette épreuve ?'
      : 'Êtes-vous sûr de vouloir mettre en prod cette épreuve ?';

    this.confirmApprove = this.updateStatusProduction;
    this.displayConfirm = true;
  }

  @action
  async cancelEdit() {
    this.args.cancelEdit();
    const localizedChallenge = this.args.localizedChallenge;
    localizedChallenge.rollbackAttributes();
    this.urlsToConsult = localizedChallenge.urlsToConsult?.join('\n') ?? '';
    this.displayUrlsToConsultField = false;
    this.invalidUrlsToConsult = '';
    this.attachmentBasename = '';
    await localizedChallenge.attachments;
    localizedChallenge.attachments.forEach((attachment) => attachment.rollbackAttributes());
    this.deletedFiles = [];
    this.notifications.sendSuccess('Modification annulée');
  }

  @action
  setDisplayUrlsToConsultField(boolean) {
    this.displayUrlsToConsultField = boolean;
    if (!boolean) {
      this.args.localizedChallenge.urlsToConsult = null;
      this.invalidUrlsToConsult = '';
      this.urlsToConsult = '';
    }
  }

  @action
  setUrlsToConsult(e) {
    const value = e.target.value;
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
    this.args.localizedChallenge.urlsToConsult = values;
    this.urlsToConsult = this.args.localizedChallenge.urlsToConsult?.join('\n') ?? '';
    e.target.value = this.urlsToConsult;
  }

  @action
  setEmbedURL(e) {
    const embedURL = e.target.value.trim();
    this._checkEmbedURL(embedURL);
    if (this.embedURLValidationStatus === 'error') return;
    this.args.localizedChallenge.embedURL = embedURL;
  }

  _checkEmbedURL(embedURL) {
    this.embedURLValidationStatus = 'default';
    try {
      new URL(embedURL);
    } catch {
      this.embedURLValidationStatus = 'error';
    }
  }

  @action
  updateUrlsToConsultTextareaHeigh(e) {
    this.urlsToConsultTextareaHeigh = e.target.value.split('\n').length ?? 2;
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
    const challengeAttachments = await this.primaryChallenge.attachments;
    const localizedAttachments = await this.args.localizedChallenge.attachments;
    if (this.args.localizedChallenge.illustration) {
      return;
    }
    challengeAttachments.push(attachment);
    localizedAttachments.push(attachment);
  }

  @action
  async removeIllustration() {
    await this.args.localizedChallenge.attachments;
    const removedFile = this.args.localizedChallenge.illustration;
    if (removedFile) {
      removedFile.deleteRecord();
      if (!removedFile.isNew) {
        this.deletedFiles.push(removedFile);
      }
    }
  }

  @action
  displayPopInIllustration() {
    this.isPopInIllustrationDisplayed = true;
  }

  @action
  closePopInIllustration() {
    this.isPopInIllustrationDisplayed = false;
  }

  @action
  async save() {
    this.displayConfirm = false;
    try {
      this.loader.start('Enregistrement...');
      await this._handleIllustration();
      await this._handlePiecesJointes(this.localizedChallenge);
      await this._saveFiles();
      await this._saveLocalizedChallenge();

      this.args.cancelEdit();
      this.invalidUrlsToConsult = '';
      this.urlsToConsult = this.args.localizedChallenge.urlsToConsult?.join('\n');
      this.displayUrlsToConsultField = false;
      this.notifications.sendSuccess('Épreuve mise à jour');
    } catch (error) {
      /* eslint-disable-next-line no-console */
      console.error('oops', error);
      this.notifications.sendError("Erreur lors de la mise à jour de l'épreuve");
    } finally {
      this.loader.stop();
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
    const attachments = await this.primaryChallenge.attachments;
    const localizedAttachmentses = await this.args.localizedChallenge.attachments;
    attachments.push(attachment);
    localizedAttachmentses.push(attachment);
  }

  @action
  async removeAttachment(removedAttachment) {
    const attachments = await this.args.localizedChallenge.attachments;
    const removedFile = attachments.find((file) => file.filename === removedAttachment.filename);
    if (removedFile) {
      removedFile.deleteRecord();
      if (!removedFile.isNew) {
        this.deletedFiles.push(removedFile);
      }
    }
  }

  @action
  async updateStatusProduction() {
    this.displayConfirm = false;
    this.args.localizedChallenge.status = this.args.localizedChallenge.isInProduction
      ? Challenge.STATUSES.PROPOSE
      : Challenge.STATUSES.VALIDE;
    try {
      this.loader.start('Enregistrement');
      await this.args.localizedChallenge.save();
      this.notifications.sendSuccess('Statut modifié avec succès !');
    } catch (error) {
      /* eslint-disable-next-line no-console */
      console.error(error);

      this.notifications.sendError(
        this.args.localizedChallenge.isInProduction
          ? "Erreur de la mise en prod de l'épreuve localisée"
          : "Erreur de la mise en pause de l'épreuve localisée",
      );
    } finally {
      this.loader.stop();
    }
  }

  @action
  confirmDeny() {
    this.displayConfirm = false;
  }

  async _handleIllustration() {
    const illustration = this.args.localizedChallenge.illustration;
    if (illustration && illustration.isNew) {
      this.loader.start("Envoi de l'illustration...");
      const newIllustration = await this.storage.uploadFile({ file: illustration.file });
      this.args.localizedChallenge.illustration.url = newIllustration.url;
    }
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

  async _handlePiecesJointes() {
    const piecesJointes = this.args.localizedChallenge.piecesJointes;
    if (piecesJointes.length === 0) {
      return this.args.localizedChallenge;
    }
    this.loader.start('Gestion des pièces jointes...');
    await Promise.all(
      piecesJointes.map((pieceJointe) => this._handlePieceJointe(pieceJointe, this.args.localizedChallenge)),
    );
    await this._renamePiecesJointes(this.args.localizedChallenge);

    return this.args.localizedChallenge;
  }

  async _renamePiecesJointes() {
    if (this.args.localizedChallenge.firstAttachmentBaseName === this.attachmentBasename || !this.attachmentBasename) {
      return;
    }
    const piecesJointes = await this.args.localizedChallenge.piecesJointes;
    for (const pieceJointe of [...piecesJointes]) {
      pieceJointe.filename = this._getPieceJointeFullFilename(pieceJointe.filename);
      await this.storage.renameFile(pieceJointe.url, pieceJointe.filename);
    }
  }

  _getPieceJointeFullFilename(filename) {
    return this.attachmentBasename + '.' + this.filePath.getExtension(filename);
  }

  async _saveFiles() {
    const attachments = (await this.args.localizedChallenge.attachments)?.slice() ?? [];
    for (const attachment of attachments) {
      await attachment.save();
    }
    for (const attachment of this.deletedFiles) {
      await attachment.save();
    }
    this.deletedFiles = [];
  }

  async _saveLocalizedChallenge() {
    this.loader.start('Enregistrement...');
    return this.args.localizedChallenge.save();
  }

  @action
  updateBasename(e) {
    this.attachmentBasename = e.target.value;
  }

  <template>
    <LocalizedChallengeViewHeader
      @challengeLocale={{@challengeLocale}}
      @localizedChallenge={{@localizedChallenge}}
      @overview={{@overview}}
      @competence={{@competence}}
      @skillId={{@skillId}}
      @edition={{@edition}}
      @edit={{@edit}}
      @openSaveConfirmPopin={{this.openSaveConfirmPopin}}
      @openProductionStatusConfirmPopin={{this.openProductionStatusConfirmPopin}}
      @save={{this.save}}
      @cancelEdit={{this.cancelEdit}}
    />
    <div class="challenge-view">
      <div class="challenge-view-editable-fields">
        <FieldToggleFieldComponent
          @edition={{@edition}}
          @model={{@localizedChallenge}}
          @modelField="urlsToConsult"
          @hideTextButton="Supprimer les URLs externes nécessaires à la résolution de l'épreuve"
          @displayTextButton="Ajouter des URLs nécessaires à la résolution de l'épreuve"
          @confirmText="URLs externes nécessaires à la résolution de l'épreuve"
          @displayField={{this.displayUrlsToConsultField}}
          @setDisplayField={{this.setDisplayUrlsToConsultField}}
          @textToolTip="Ces URLs doivent être trouvées par l’utilisateur car elles ne sont pas communiquées dans la consigne ou les propositions."
        >
          <label class="challenge-view-url-to-consult--label" for={{this.textareaId}}>
            URLs externes nécessaires à la résolution de l'épreuve
          </label>
          {{#if this.edition}}
            <p class="challenge-view-url-to-consult--info">Séparer les liens par un retour à la ligne</p>
          {{/if}}
          <textarea
            class="challenge-view-url-to-consult--textarea"
            rows={{this.urlsToConsultTextareaHeigh}}
            id={{this.textareaId}}
            readonly={{this.readonly}}
            {{on "input" this.updateUrlsToConsultTextareaHeigh}}
            {{on "change" this.setUrlsToConsult}}
          >{{this.urlsToConsult}}</textarea>
        </FieldToggleFieldComponent>
        {{#if this.invalidUrlsToConsult}}
          <p class="message message--red">
            URLs invalides :
            {{this.invalidUrlsToConsult}}
          </p>
        {{/if}}
        {{#if this.shouldDisplayEmbedURL}}
          {{#if this.shouldDisplayInputEmbedURL}}
            <PixInput
              @id="embedURL"
              @value={{this.embedURL}}
              readonly={{this.readonly}}
              {{on "change" this.setEmbedURL}}
              @validationStatus={{this.embedURLValidationStatus}}
              @errorMessage="Votre URL n'est pas bien formatée"
            >
              <:label>Embed URL</:label>
            </PixInput>
          {{/if}}
          {{#unless @localizedChallenge.embedURL}}
            <div class="challenge-view-default-embed-url">
              <p data-testid="default-embed-url">Embed URL auto-générée : {{@localizedChallenge.defaultEmbedURL}}</p>
            </div>
          {{/unless}}
        {{/if}}
        {{#if this.shouldDisplayIllustration}}
          <Illustration
            @title="Illustration"
            @value={{@localizedChallenge.illustration}}
            @edition={{@edition}}
            @addIllustration={{this.addIllustration}}
            @removeIllustration={{this.removeIllustration}}
            @display={{this.displayPopInIllustration}}
          />
        {{/if}}
        {{#if this.shouldDisplayAttachment}}
          <Files
            @title="Pièces jointes"
            @value={{@localizedChallenge.piecesJointes}}
            @attachmentBaseName={{@localizedChallenge.firstAttachmentBaseName}}
            @edition={{@edition}}
            @removeAttachment={{this.removeAttachment}}
            @addAttachment={{this.addAttachment}}
            @updateBasename={{this.updateBasename}}
          />
        {{/if}}
        <PixSelect
          @id="localized-select-geography"
          @placeholder="Géographie"
          @isDisabled={{this.readonly}}
          @onChange={{fn (mut @localizedChallenge.geography)}}
          @value={{this.localizedChallengeGeographyValue}}
          @options={{this.countryList}}
          @hideDefaultOption={{true}}
        >
          <:label>Géographie</:label>
        </PixSelect>
      </div>

      <PixInput @id="localized-challenge-id" @value={{@localizedChallenge.id}} readonly>
        <:label>Id</:label>
      </PixInput>
      {{#if this.shouldDisplayIllustration}}
        <PopInImage
          @imageSrc={{@localizedChallenge.illustration.url}}
          @close={{this.closePopInIllustration}}
          @showModal={{this.isPopInIllustrationDisplayed}}
        />
      {{/if}}
      <PopInConfirm
        @title={{this.confirmTitle}}
        @content={{this.confirmContent}}
        @onApprove={{this.confirmApprove}}
        @onDeny={{this.confirmDeny}}
        @showModal={{this.displayConfirm}}
      />
    </div>
  </template>
}
