import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import Files from '../field/files';
import Illustration from '../field/illustration';
import Textarea from '../field/textarea';
import FieldToggleFieldComponent from '../field/toggle-field';
import LocalizedChallengeViewHeader from './localized-challenge-view-header';
export default class LocalizedChallenge extends Component {
  @service countries;

  @tracked helpUrlsToConsult = '<p>Séparer les liens par un retour à la ligne</p>';
  @tracked invalidUrlsToConsult = '';

  challengeTypeOptions = [
    { value: 'QCU', label: 'QCU' },
    { value: 'QCM', label: 'QCM' },
    { value: 'QROC', label: 'QROC' },
    { value: 'QROCM-ind', label: 'QROCM-ind' },
    { value: 'QROCM-dep', label: 'QROCM-dep' },
    { value: 'autoReply', label: 'Embed-auto' },
  ];

  get primaryChallenge() {
    return this.args.challengeLocale.challenge;
  }

  get hasTimer() {
    return !!this.args.challengeLocale.challenge.timer;
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

  get shouldDisplayAttachment() {
    return !!this.primaryChallenge.piecesJointes.length;
  }

  get urlToConsult() {
    return this.localizedChallenge.urlsToConsult?.join('\n') ?? '';
  }

  @action
  toDeleteWhenEditionIsOK() {
    return null;
  }

  <template>
    <LocalizedChallengeViewHeader
      @challengeLocale={{@challengeLocale}}
      @localizedChallenge={{@localizedChallenge}}
      @overview={{@overview}}
      @competence={{@competence}}
      @skillId={{@skillId}}
    />
    <div class="challenge-view">
      <div class="challenge-view-editable-fields">
        {{#if this.shouldDisplayEmbedURL}}
          <div>
            <PixInput @id="embedURL" @value={{this.embedURL}} readonly>
              <:label>Embed URL</:label>
            </PixInput>

            {{#unless @localizedChallenge.embedURL }}
              <div class="challenge-view-default-embed-url">
                <p data-testid="default-embed-url">Embed URL auto-générée : {{@localizedChallenge.defaultEmbedURL}}</p>
              </div>
            {{/unless}}
          </div>
        {{/if}}
        <Illustration
          @title="Illustration"
          @value={{@localizedChallenge.illustration}}
          @edition={{false}}
          @addIllustration={{this.toDeleteWhenEditionIsOK}}
          @removeIllustration={{this.toDeleteWhenEditionIsOK}}
          @display={{this.toDeleteWhenEditionIsOK}}
          data-test-file-input-illustration
        />
        {{#if this.shouldDisplayAttachment}}
          <Files
            @title="Pièces jointes"
            @value={{@localizedChallenge.piecesJointes}}
            @baseName={{@localizedChallenge.attachmentBaseName}}
            @edition={{false}}
            @removeAttachment={{this.toDeleteWhenEditionIsOK}}
            @addAttachment={{this.toDeleteWhenEditionIsOK}}
          />
        {{/if}}
        <PixSelect
          @id="localized-select-geography"
          @placeholder="Géographie"
          @isDisabled={{true}}
          @onChange={{fn (mut @localizedChallenge.geography)}}
          @value={{this.localizedChallengeGeographyValue}}
          @options={{this.countryList}}
          @hideDefaultOption={{true}}
        >
          <:label>Géographie</:label>
        </PixSelect>
        <FieldToggleFieldComponent
          @edition={{false}}
          @model={{@localizedChallenge}}
          @modelField="urlsToConsult"
          @hideTextButton="Supprimer les URLs externes nécessaires à la résolution de l'épreuve"
          @displayTextButton="Ajouter des URLs nécessaires à la résolution de l'épreuve"
          @confirmText="URLs externes nécessaires à la résolution de l'épreuve"
          @displayField={{@localizedChallenge.urlsToConsult}}
          @setDisplayField={{this.primaryChallenge.localizedChallenge}}
          @textToolTip="Ces URLs doivent être trouvées par l’utilisateur car elles ne sont pas communiquées dans la consigne ou les propositions."
        >
          <Textarea
            @title="URLs externes nécessaires à la résolution de l'épreuve"
            @value={{this.urlToConsult}}
            @edition={{false}}
            @change={{this.toDeleteWhenEditionIsOK}}
            @helpContent={{this.helpUrlsToConsult}}
            data-test-localized-challenge-urls-to-consult
            @id="localized-challenge-urls-to-consult"
          />
        </FieldToggleFieldComponent>
        {{#if this.invalidUrlsToConsult}}
          <p class="ui red message" data-test-invalid-urls-to-consult>
            URLs invalides :
            {{this.invalidUrlsToConsult}}
          </p>
        {{/if}}
      </div>

      <PixInput
        @id="localized-challenge-id"
        @value={{@localizedChallenge.id}}
        readonly
      >
        <:label>Id</:label>
      </PixInput>
    </div>
  </template>
}
